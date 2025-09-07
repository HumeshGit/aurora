const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const User = require('./models/User');
const Message = require('./models/Message');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 8000;

// Connect MongoDB
mongoose.connect('mongodb://localhost:27017/match_chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(express.static('public'));

let socketToUserMap = new Map();

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  let currentUser;

  // Register user
  socket.on('register', async (username) => {
    let user = await User.findOne({ username });
    if (!user) user = await User.create({ username });

    user.online = true;
    user.socketId = socket.id;
    await user.save();

    currentUser = user;
    socketToUserMap.set(socket.id, user._id);

    console.log(`${username} is online`);

    // Typing indicator
    socket.on('typing', ({ room }) => {
      socket.to(room).emit('show_typing', currentUser.username);
    });

    // Handle chat message
    socket.on('chat_message', async ({ room, message }) => {
      socket.to(room).emit('chat_message', { message });

      await Message.create({
        from: currentUser.username,
        to: "room", // You may store actual receiver name if needed
        message
      });
    });
  });

  // Matchmaking
  socket.on('check_online', async () => {
    console.log(`${currentUser.username} is searching...`);

    currentUser.status = 'searching';
    await currentUser.save();

    setTimeout(async () => {
      const updatedUser = await User.findById(currentUser._id);
      if (updatedUser.status !== 'searching') return;

      const candidates = await User.find({
        _id: { $ne: currentUser._id },
        online: true,
        status: 'searching'
      });

      const available = candidates.filter(u => io.sockets.sockets.get(u.socketId));

      if (available.length === 0) {
        socket.emit('no_users');
        updatedUser.status = 'idle';
        await updatedUser.save();
        return;
      }

      const partner = available[Math.floor(Math.random() * available.length)];
      const room = uuidv4();

      socket.join(room);
      io.sockets.sockets.get(partner.socketId)?.join(room);

      updatedUser.status = 'matched';
      updatedUser.room = room;
      partner.status = 'matched';
      partner.room = room;

      await updatedUser.save();
      await partner.save();

      io.to(socket.id).emit('chat_start', {
        room,
        partner: partner.username
      });

      io.to(partner.socketId).emit('chat_start', {
        room,
        partner: updatedUser.username
      });

      console.log(`Room "${room}" alloted to ${updatedUser.username} and ${partner.username}`);
    }, 20000);
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    const userId = socketToUserMap.get(socket.id);
    if (userId) {
      const user = await User.findByIdAndUpdate(userId, {
        online: false,
        socketId: null,
        status: 'idle',
        room: null
      }, { new: true });

      const partner = await User.findOne({ room: user.room, _id: { $ne: user._id } });
      if (partner) {
        partner.status = 'idle';
        partner.room = null;
        await partner.save();

        socket.to(partner.socketId).emit('partner_left', `${user.username} has left the chat.`);
      }

      socketToUserMap.delete(socket.id);
      console.log(`User ${user.username} disconnected and left room ${user.room}`);
    }

    // Notify rooms
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit('partner_left', `${currentUser?.username || 'User'} has left the chat.`);
        console.log(`Notified room ${roomId}`);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
