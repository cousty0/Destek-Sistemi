import config from "../models/config.js";
export default async (guild) => {
    const conf = await config.findOne({ GuildID: guild.id });
    config.updateOne({ _id: conf._id }, { Komutyetki: false });
};
