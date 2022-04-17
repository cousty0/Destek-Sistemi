import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import config from "../models/config.js";
export default async (guild) => {
    const { client } = guild;
    const { commands } = client;
    const komutlar = await guild.commands.fetch({ withLocalizations: true }).catch(() => { }) || [];
    let yuklenecek = commands.size !== komutlar.size || !komutlar.every(komut => {
        const cmd = commands.find(command => command?.help?.name === komut.name)?.help;
        if (!cmd) return false;
        return ((komut.description ? (komut.description === cmd.description) : true) && (komut.defaultPermission === (cmd.defaultPermission != undefined ? cmd.defaultPermission : true)))
    }) || !commands.every(komut => {
        const cmd = komutlar.find(command => command?.name === komut.help.name)
        if (!cmd) return false;
        return ((komut.help.description ? (komut.help.description === cmd.description) : true) && (cmd.defaultPermission === (komut.help.defaultPermission != undefined ? komut.help.defaultPermission : true)))
    })
    if (yuklenecek) guild.commands.set(commands.map((komut) => komut.help)).then(() => client.log(`${guild.name} Adlı Sunucuya Komutlar Başarıyla Kaydedildi!`)).catch(async (e) => {
        if (e.code === 50001) {
            const member = await guild.fetchOwner();
            const data = await config.findOne({ GuildID: guild.id, Komutyetki: true });
            if (data) return;
            member.user.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                        .setColor("RED")
                        .setDescription(`Botun ${guild.name} Adlı Sunucuya Komutları Kayıt Etme Yetkim Bulunmuyor!\nBotu Sunucunuzdan Atıp Aşağıda Bulunan Davet Et Butonuna Tıklayarak Botu Tekrardan Sunucunuza Ekleyiniz!`)
                        .setFooter({ text: client.user.tag, iconURL: client.user.avatarURL() })
                        .setTimestamp()
                ],
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setEmoji("🔗")
                            .setLabel("Davet Et")
                            .setStyle("LINK")
                            .setURL(client.generateInvite({ permissions: "8", scopes: ["bot", "applications.commands"], })))
                ]
            }).then(async () => await config.updateOne({ GuildID: guild.id }, { Komutyetki: (true) })).catch(() => { });
        } else client.log(e);
    });
};