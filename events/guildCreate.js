import { mkdir } from "fs";
import configs from "../models/config.js";
export default async (guild) => {
    mkdir(`./ticketlar/${guild.id}`, { recursive: true }, (err) => { if (err) guild.client.log(err); });
    const data = await configs.findOne({ GuildID: guild.id });
    if (!data) new configs({ GuildID: guild.id, Destek: {}, Komutyetki: false }).save();
    (await import("../utils/komut_kayıt.js")).default(guild);
};
