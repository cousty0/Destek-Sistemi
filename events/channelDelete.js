import configs from "../models/config.js";
export default async (channel) => {
    let data = await configs.findOne({ GuildID: channel.guild.id });
    if (!data) data = new configs({ GuildID: channel.guild.id, Destek: {}, Komutyetki: false }).save();
    if (!data.Destek) data.Destek = {};
    if (channel.id === data.Destek.LogKanalı) data.Destek.LogKanalı = null;
    if (channel.id === data.Destek.AçıkKategori) data.Destek.AçıkKategori = null;
    if (channel.id === data.Destek.KapalıKategori) data.Destek.KapalıKategori = null;
    await configs.updateOne({ _id: data._id }, { Destek: data.Destek });
};
