const mongoose = require("mongoose")

const chat_list = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    online:{
        type:Boolean,
        default:false
    },
    socketId:{
        type:String,
        default:null
    },
    status: {
        type: String,
        enum: ['idle', 'searching', 'matched'],
        default: 'idle'
    },
    room: {
        type: String,
        default: null
    }
})

module.exports = mongoose.model("User" , chat_list)