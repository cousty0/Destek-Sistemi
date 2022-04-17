import { MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import config from "../models/config.js";
import destek from "../models/destek.js";
export const run = async (client, interaction) => {
    let data = await config.findOne({ GuildID: interaction.guild.id });
    if (!data) data = new config({ GuildID: interaction.guild.id, Destek: {}, Komutyetki: false }).save();
    if (!data.Destek) data.Destek = {};
    if (!data.Destek.RolEkip) data.Destek.RolEkip = (await interaction.guild.roles.create({ name: `Destek Ekibi` })).id;
    if (!data.Destek?.RolCezalı) data.Destek.RolCezalı = (await interaction.guild.roles.create({ name: `Destek Cezalı` })).id;
    if (!data.Destek.AçıkKategori) data.Destek.AçıkKategori = (await interaction.guild.channels.create(`Destek Talepleri`, { type: "GUILD_CATEGORY", permissionOverwrites: [{ id: interaction.guild.roles.everyone.id, allow: [], type: "ROLE", deny: ["VIEW_CHANNEL"] }, { id: data.Destek.RolEkip, type: "ROLE", allow: ["VIEW_CHANNEL"], deny: [] }] })).id;
    await config.updateOne({ _id: data._id }, { Destek: data.Destek });
    if (interaction.member.roles.cache.has(data.Destek.RolCezalı)) {
        const olusturamazembed = new MessageEmbed()
            .setColor("#ff0000")
            .setDescription(`Destek oluşturma yetkin bulunmuyor!`)
            .setTitle(`Destek Sistemi`)
            .setTimestamp();
        return interaction.reply({ embeds: [olusturamazembed], ephemeral: true });
    } else {
        const kontrol = await destek.findOne({ UserID: interaction.user.id });
        if (kontrol) {
            let mesaj = await (await interaction.guild.channels.fetch(kontrol.ChannelID)).messages
                .fetch(kontrol.MessageID)
                .catch(() => { });
            if (!mesaj) {
                mesaj = await (await interaction.guild.channels.fetch(kontrol.ChannelID)).send({
                    content: `<@${kontrol.UserID}> hoş geldin! <@&${data.Destek.RolEkip}>' ler sana yardımcı olacak!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor("#00ff00")
                            .setDescription(`Yardım yolda!\nTalebi kapatmak için ❌ emojisine tıkla!`)
                            .setFooter({ text: "cousty" })
                            .setTitle(`Destek Sistemi`)
                            .setTimestamp(),
                    ],
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageButton()
                                .setCustomId("destekkapat")
                                .setLabel("Destek Talebini Kapat")
                                .setStyle("DANGER")
                                .setEmoji("❌")
                        ),
                    ],
                });
                kontrol.MessageID = mesaj.id;
                await destek.updateOne({ _id: kontrol._id }, { MessageID: mesaj.id });
            }
            mesaj.components[0].components[0].disabled = false;
            mesaj.edit({ components: mesaj.components });
            const destekvarembed = new MessageEmbed()
                .setColor("#ff0000")
                .setDescription(`Zaten açık bir destek talebin bulunuyor! <#${kontrol.ChannelID}> kanalına gidebilirsiniz.`)
                .setTitle(`Destek Sistemi`)
                .setTimestamp();
            return interaction.reply({ embeds: [destekvarembed], ephemeral: true });
        } else {
            const kanal = await interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
                type: "GUILD_TEXT",
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        allow: [],
                        type: "ROLE",
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                    },
                    {
                        id: interaction.user.id,
                        type: "USER",
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                        deny: [],
                    },
                    {
                        id: data.Destek.RolEkip,
                        type: "ROLE",
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                        deny: [],
                    },
                ],
                parent: data.Destek.AçıkKategori,
            }
            );
            const destekaçıldıembed = new MessageEmbed()
                .setColor("#00ff00")
                .setDescription(`Destek talebin <#${kanal.id}> kanalı olarak oluşturuldu.`)
                .setTitle(`Destek Sistemi`)
                .setTimestamp();
            interaction.reply({ embeds: [destekaçıldıembed], ephemeral: true });
            const destekmesaj = `<@${interaction.user.id}> hoş geldin! <@&${data.Destek.RolEkip}>' ler sana yardımcı olacak!`;
            const kanalembed = new MessageEmbed()
                .setColor("#00ff00")
                .setDescription(`Yardım yolda!\nTalebi kapatmak için ❌ emojisine tıkla!`)
                .setFooter({ text: "cousty" })
                .setTitle(`Destek Sistemi`)
                .setTimestamp();
            const rows = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("destekkapat")
                    .setLabel("Destek Talebini Kapat")
                    .setStyle("DANGER")
                    .setEmoji("❌")
            );
            const mesaj = await kanal.send({ content: destekmesaj, embeds: [kanalembed], components: [rows] });
            const newDestek = new destek({ UserID: interaction.user.id, ChannelID: kanal.id, MessageID: mesaj.id });
            newDestek.save();
        }
    }
};
export const help = {
    name: "destekoluştur",
};
