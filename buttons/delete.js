export const run = async (client, interaction) => {
    interaction.deferUpdate();
    interaction.message.components[0].components[0].disabled = true;
    interaction.message.components[0].components[1].disabled = true;
    interaction.message.components[0].components[2].disabled = true;
    interaction.message.edit({ components: interaction.message.components });
    interaction.channel.send({ content: "Destek talebi 5 saniye içinde kapatılıyor..." });
    setTimeout(() => interaction.channel.delete(), 5000);
};
export const help = {
    name: "delete",
};
