import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: false },
    password: { type: String, required: true } // for demo only (plain). Use hashing in real apps.
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
