import { MessageActionRow, MessageButton } from "discord.js";
import config from "../models/config.js";
export const run = async (client, interaction) => {
    const data = await config.findOne({
        GuildID: interaction.guild.id,
    });
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
    const onayred = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId("onay")
                .setLabel("Evet")
                .setStyle("SUCCESS")
                .setEmoji("✅")
        )
        .addComponents(
            new MessageButton()
                .setCustomId("red")
                .setLabel("Hayır")
                .setStyle("DANGER")
                .setEmoji("❌")
        );
    interaction.deferUpdate();
    interaction.message.components[0].components[0].disabled = true;
    interaction.message.edit({ components: interaction.message.components });
    interaction.channel.send({ content: `Destek talebini kapatmak istediğinize emin misiniz?`, components: [onayred] });
};
export const help = {
    name: "destekkapat",
};
