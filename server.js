import { Client } from "discord.js";
import { readFile, mkdir } from "fs/promises";
import configs from "./models/config.js";
import mongoose from "mongoose";
const client = new Client({ intents: 32767, restTimeOffset: 0, });
client.ayarlar = JSON.parse(await readFile(new URL("./ayarlar.json", import.meta.url)));
client.emoji = (emoji) => (client.guilds.cache.get("556876135389200407")?.emojis.cache.find((e) => e.name === emoji || e.id === emoji) || client.guilds.cache.get("960857043122675722")?.emojis.cache.find((e) => e.name === emoji || e.id === emoji) || `:${emoji}:`);
client.log = (message) => console.log(`[${new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", seconds: "2-digit", })}]`, message);
client.on("ready", async () => client.guilds.cache.forEach(async guild => {
    mkdir(`./ticketlar/${guild.id}`, { recursive: true }, (err) => { if (err) console.log(err) });
    const data = await configs.findOne({ GuildID: guild.id });
    if (!data) new configs({ GuildID: guild.id, Destek: {}, Komutyetki: false }).save();
}));
(await import("./utils/eventLoader.js")).default(client);
mongoose.connect("mongodb://127.0.0.1:27017/Destek", { useNewUrlParser: true, useUnifiedTopology: true, });
client.login(client.ayarlar.token);