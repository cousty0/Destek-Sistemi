import { MessageEmbed, MessageAttachment } from "discord.js";
import destekler from "../models/destekler.js";
import { writeFile } from "fs";
import { createTranscript } from "discord-html-transcripts";
import config from "../models/config.js";
export const run = async (client, interaction) => {
    interaction.deferUpdate();
    const kaydediliyorembed = new MessageEmbed().setColor("#ffee58").setDescription(`Destek talebi kaydediliyor...`);
    const kaydediliyormesaj = await interaction.channel.send({ embeds: [kaydediliyorembed] });
    const veri = await destekler.findOne({ ChannelID: interaction.channel.id });
    const bulamıyorumembed = new MessageEmbed()
        .setColor("#ff0000")
        .setDescription(`Destek talebinin sahibini bulamıyorum!`)
        .setTitle(`Destek Sistemi`)
        .setTimestamp();
    if (!veri) return interaction.reply({ embeds: [bulamıyorumembed], ephemeral: true });
    let data = await config.findOne({ GuildID: interaction.guild.id });
    if (!data) data = new config({ GuildID: interaction.guild.id, Destek: {}, Komutyetki: false }).save();
    if (!data.Destek) data.Destek = {};
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
    const buff = await createTranscript(interaction.channel, {
        limit: -1,
        returnBuffer: true,
        fileName: `talep-${veri.UserID}-${Date.now()}.html`,
    });
    client.channels.cache.get(data.Destek.LogKanalı).send({
        content: `<@${veri.UserID}> [ID: ${veri.UserID}] adlı kullanıcının talebi, <@${interaction.user.id}> tarafından kaydedildi!`,
        files: [
            new MessageAttachment(
                buff,
                `talep-${veri.UserID}-${Date.now()}.html`
            )
        ]
    });
    writeFile(`./ticketlar/${interaction.guild.id}/ticket-${veri.UserID}-${Date.now()}.html`,
        buff.toString(),
        async (err) => { if (err) console.log(err); });
    const kaydedildiembed = new MessageEmbed().setColor("#66bb6a").setDescription(`Destek talebi <#${data.Destek.LogKanalı}> kanalına kaydedildi!`);
    kaydediliyormesaj.edit({ embeds: [kaydedildiembed] });
};
export const help = {
    name: "transcript",
};
