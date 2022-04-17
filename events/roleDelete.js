import configs from "../models/config.js";
export default async (role) => {
    let data = await configs.findOne({ GuildID: role.guild.id });
    if (!data) data = new configs({ GuildID: role.guild.id, Destek: {}, Komutyetki: false }).save();
    if (!data.Destek) data.Destek = {};
    await configs.updateOne({ _id: data._id }, { Destek: data.Destek });
    if (role.id === data.Destek.RolEkip) data.Destek.RolEkip = null;
    if (role.id === data.Destek.RolCezalı) data.Destek.RolCezalı = null;
    await configs.updateOne({ _id: data._id }, { Destek: data.Destek });
};
