import { MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import config from "../models/config.js";
import destek from "../models/destek.js";
export const run = async (client, interaction) => {
    const data = await config.findOne({ GuildID: interaction.guild.id });
    if (!data) data = new config({ GuildID: interaction.guild.id, Destek: {}, Komutyetki: false }).save();
    if (!data.Destek) data.Destek = {};
    if (!data.Destek.RolEkip) data.Destek.RolEkip = (await interaction.guild.roles.create({ name: `Destek Ekibi` })).id;
    const veri = await destek.findOne({ ChannelID: interaction.channel.id });
    let mesaj = await interaction.channel.messages.fetch(veri.MessageID).catch(() => { });
    if (!mesaj) {
        mesaj = await interaction.channel.send({
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
                )
            ]
        });
        veri.MessageID = mesaj.id;
        await destek.updateOne({ _id: veri._id }, { MessageID: mesaj.id });
    }
    mesaj.components[0].components[0].disabled = false;
    mesaj.edit({ components: mesaj.components });
    interaction.message.delete();
};
export const help = {
    name: "red",
};