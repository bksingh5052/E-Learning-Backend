import { Schema, model } from "mongoose";

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: "1h", //1 hour
  },
});

export default model("Token", tokenSchema);
