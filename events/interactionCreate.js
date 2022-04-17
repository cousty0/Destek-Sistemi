import { MessageEmbed } from "discord.js";
export default async (interaction) => {
    if (interaction.isApplicationCommand()) {
        let cmd;
        if (interaction.client.commands.has(interaction.commandName)) cmd = interaction.client.commands.get(interaction.commandName);
        else {
            const bulunamadıembed = new MessageEmbed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true, size: 1024 }) })
                .setDescription(`Aradığınız Komudu Bulamadım!`)
                .setTimestamp()
                .setColor(`RANDOM`)
                .setFooter({ text: interaction.client.user.tag, iconURL: interaction.client.user.avatarURL({ dynamic: true, size: 1024 }) });
            return interaction.reply({ embeds: [bulunamadıembed], ephemeral: true });
        }
        if (cmd) await cmd.run(interaction.client, interaction)
    } else if (interaction.isButton()) {
        let cmd;
        if (interaction.client.buttons.has(interaction.customId)) cmd = interaction.client.buttons.get(interaction.customId);
        if (cmd) await cmd.run(interaction.client, interaction)
    }
};
