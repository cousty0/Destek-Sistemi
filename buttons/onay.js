import { MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import config from "../models/config.js";
import destek from "../models/destek.js";
import destekler from "../models/destekler.js";
export const run = async (client, interaction) => {
    const veri = await destek.findOne({ ChannelID: interaction.channel.id });
    if (veri) {
        const data = await config.findOne({ GuildID: interaction.guild.id });
        if (!data) data = new config({ GuildID: interaction.guild.id, Destek: {}, Komutyetki: false }).save();
        if (!data.Destek) data.Destek = {};
        if (!data.Destek.RolEkip) data.Destek.RolEkip = (await interaction.guild.roles.create({ name: `Destek Ekibi` })).id;
        if (!data.Destek.KapalıKategori) data.Destek.KapalıKategori = (await interaction.guild.channels.create(`Kapanan Talepler`, {
            type: "GUILD_CATEGORY",
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone.id,
                    allow: [],
                    type: "ROLE",
                    deny: ["VIEW_CHANNEL"],
                },
                {
                    id: data.Destek.RolEkip,
                    type: "ROLE",
                    allow: ["VIEW_CHANNEL"],
                    deny: [],
                }
            ]
        })).id;
        if (!data.Destek.LogKanalı) data.Destek.LogKanalı = (await interaction.guild.channels.create(`destek-log`, {
            type: "GUILD_TEXT",
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone.id,
                    allow: [],
                    type: "ROLE",
                    deny: ["VIEW_CHANNEL"],
                },
                {
                    id: data.Destek.RolEkip,
                    type: "ROLE",
                    allow: ["VIEW_CHANNEL"],
                    deny: [],
                }
            ]
        })).id;
        await config.updateOne({ _id: data._id }, { Destek: data.Destek });
        const yenisim = interaction.channel.name.replace("ticket-", "closed-");
        const kapatıldıembed = new MessageEmbed()
            .setColor("#fbfe32")
            .setDescription(`Destek talebi <@${interaction.user.id}> tarafından kapatıldı.`);
        interaction.channel.edit({
            name: yenisim, permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone.id,
                    allow: [],
                    type: "ROLE",
                    deny: [
                        "VIEW_CHANNEL",
                        "SEND_MESSAGES",
                        "READ_MESSAGE_HISTORY",
                    ],
                },
                {
                    id: data.Destek.RolEkip,
                    type: "ROLE",
                    allow: [
                        "VIEW_CHANNEL",
                        "SEND_MESSAGES",
                        "READ_MESSAGE_HISTORY",
                    ],
                    deny: [],
                }
            ],
            parent: data.Destek.KapalıKategori
        });
        interaction.channel.send({ embeds: [kapatıldıembed] });
        interaction.message.delete();
        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("transcript")
                .setLabel("Transcript")
                .setStyle("SECONDARY")
                .setEmoji("📋"),
            new MessageButton()
                .setCustomId("reopen")
                .setLabel("Aç")
                .setStyle("SECONDARY")
                .setEmoji("🔁"),
            new MessageButton()
                .setCustomId("delete")
                .setLabel("Sil")
                .setStyle("SECONDARY")
                .setEmoji("⛔")
        );
        const controlembed = new MessageEmbed().setColor("#2f3136").setDescription(`\`\`\`Destek Kontrol Paneli\`\`\``);
        await interaction.channel.send({ embeds: [controlembed], components: [row] });
        const newDestekler = new destekler({ UserID: veri.UserID, ChannelID: veri.ChannelID, MessageID: veri.MessageID, CreatedAt: interaction.channel.createdTimestamp, RemovedAt: Date.now(), RemovedUserID: interaction.user.id });
        newDestekler.save();
        await destek.deleteOne({ ChannelID: interaction.channel.id });
    } else {
        const bulamıyorumembed = new MessageEmbed()
            .setColor("#ff0000")
            .setDescription(`Destek talebinin sahibini bulamıyorum!`)
            .setTitle(`Destek Sistemi`)
            .setTimestamp();
        return interaction.reply({ embeds: [bulamıyorumembed], ephemeral: true });
    }
};
export const help = {
    name: "onay",
};