import { MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import config from "../models/config.js";
import destek from "../models/destek.js";
import destekler from "../models/destekler.js";
export const run = async (client, interaction) => {
    const veri = await destekler.findOne({ ChannelID: interaction.channel.id });
    const bulamıyorumembed = new MessageEmbed()
        .setColor("#ff0000")
        .setDescription(`Destek talebinin sahibini bulamıyorum!`)
        .setTitle(`Destek Sistemi`)
        .setTimestamp();
    if (!veri) return interaction.reply({ embeds: [bulamıyorumembed], ephemeral: true });
    const data = await config.findOne({ GuildID: interaction.guild.id });
    if (!data) data = new config({ GuildID: interaction.guild.id, Destek: {}, Komutyetki: false }).save();
    if (!data.Destek) data.Destek = {};
    if (!data.Destek.RolEkip) data.Destek.RolEkip = (await interaction.guild.roles.create({ name: `Destek Ekibi` })).id;
    if (!data.Destek.AçıkKategori) data.Destek.AçıkKategori = (await interaction.guild.channels.create(`Destek Talepleri`, {
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
    await config.updateOne({ _id: data._id }, { Destek: data.Destek });
    let mesaj = await interaction.channel.messages.fetch(veri.MessageID).catch(() => { });
    if (!mesaj) mesaj = await interaction.channel.send({
        content: `<@${veri.UserID}> hoş geldin! <@&${data.Destek.RolEkip}>' ler sana yardımcı olacak!`,
        embeds: [
            new MessageEmbed()
                .setColor("#00ff00")
                .setDescription(
                    `Yardım yolda!\nTalebi kapatmak için ❌ emojisine tıkla!`
                )
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
    const newdestek = new destek({ UserID: veri.UserID, MessageID: mesaj.id, ChannelID: interaction.channel.id });
    newdestek.save();
    destekler.deleteOne({ _id: veri._id });
    mesaj.components[0].components[0].disabled = false;
    mesaj.edit({ components: mesaj.components });
    const yeniisim = interaction.channel.name.replace("closed-", "ticket-");
    interaction.channel.edit({ name: yeniisim, parent: data.Destek.AçıkKategori });
    interaction.message.delete();
    const yenidenaciklama = new MessageEmbed().setColor("#66bb6a").setDescription(`Destek talebi yeniden açıldı!`);
    interaction.channel.send({ embeds: [yenidenaciklama] });
};
export const help = {
    name: "reopen",
};
