import mongoose from "mongoose";
export default mongoose.model("config", new mongoose.Schema({ Komutyetki: { type: Boolean }, GuildID: { type: String }, Destek: { type: Object } }));