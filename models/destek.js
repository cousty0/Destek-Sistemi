import mongoose from "mongoose";
export default mongoose.model("destek", new mongoose.Schema({ UserID: { type: String }, ChannelID: { type: String }, MessageID: { type: String } }));