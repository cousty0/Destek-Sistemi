import { Collection } from "discord.js";
import komut_kayıt from "../utils/komut_kayıt.js";
import { readdirSync } from "fs";
export default async (client) => {
    client.log(client.user.username + " Adıyla Giriş Yapıldı!");
    client.commands = new Collection();
    readdirSync("./commands").filter(dosya => dosya.endsWith(".js")).forEach(async file => {
        const command = await import(`../commands/${file}`);
        await client.commands.set(command.help.name, command);
    });
    client.buttons = new Collection();
    readdirSync("./buttons").filter(dosya => dosya.endsWith(".js")).forEach(async file => {
        const command = await import(`../buttons/${file}`);
        await client.buttons.set(command.help.name, command);
    });
    await client.guilds.fetch({ cache: true, force: true })
    client.guilds.cache.forEach(komut_kayıt);
    client.user.presence.set({ status: "online", activities: [{ name: `Developers: @cousty#9410 & @elüf#6410`, type: 5, url: `https://cousty.me`, },], });
    client.log("Komutlar Apiye Başarıyla Gönderildi!");
};
