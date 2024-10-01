import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, unique: true, required: true },
  password: { type: String },
  location: String,
  avatarUrl: String,
  socialOnly: { type: Boolean, default: false },
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 3);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
