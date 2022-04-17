import config from "../models/config.js";
import { MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
export const run = async (client, interaction) => {
    const islem = interaction.options.getSubcommand();
    switch (islem) {
        case "gönder": {
            const data = await config.findOne({ GuildID: interaction.guild.id, });
            if (!data) new config({ GuildID: interaction.guild.id, Destek: {}, Komutyetki: false }).save();
            const kanal = interaction.options.getChannel("kanal");
            const embeddestek = new MessageEmbed()
                .setTitle("Destek Talebi Aç!")
                .setDescription("Destek talebi için 📩 emojisine tıklayın!")
                .setColor("GREEN")
                .setFooter({ text: "cousty", iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }), });
            const rowdestek = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("destekoluştur")
                    .setLabel("Destek Talebi")
                    .setStyle("SUCCESS")
                    .setEmoji("📩")
            );
            if (!kanal.viewable || !interaction.guild.me.permissionsIn(kanal.id).has("SEND_MESSAGES") || !interaction.guild.me.permissionsIn(kanal.id).has("EMBED_LINKS")) return interaction.reply({ content: `Bu kanalda gerekli işlemleri yapmak için iznim yok!` });
            if (!data.Destek) data.Destek = {};
            if (!data.Destek.RolEkip) data.Destek.RolEkip = (await interaction.guild.roles.create({ name: "Destek Ekibi" })).id;
            if (!data.Destek?.RolCezalı) data.Destek.RolCezalı = (await interaction.guild.roles.create({ name: "Destek Cezalı" })).id;
            if (!data.Destek.AçıkKategori) data.Destek.AçıkKategori = (await interaction.guild.channels.create("Destek Talepleri", { type: "GUILD_CATEGORY", permissionOverwrites: [{ id: interaction.guild.roles.everyone.id, allow: [], type: "ROLE", deny: ["VIEW_CHANNEL"], }, { id: data.Destek.RolEkip, type: "ROLE", allow: ["VIEW_CHANNEL"], deny: [], },], })).id;
            if (!data.Destek.KapalıKategori) data.Destek.KapalıKategori = (await interaction.guild.channels.create("Kapanmış Talepler", { type: "GUILD_CATEGORY", permissionOverwrites: [{ id: interaction.guild.roles.everyone.id, allow: [], type: "ROLE", deny: ["VIEW_CHANNEL"], }, { id: data.Destek.RolEkip, type: "ROLE", allow: ["VIEW_CHANNEL"], deny: [], },], })).id;
            if (!data.Destek.LogKanalı) data.Destek.LogKanalı = (await interaction.guild.channels.create("destek-denetim-kaydı", { type: "GUILD_TEXT", permissionOverwrites: [{ id: interaction.guild.roles.everyone.id, allow: [], type: "ROLE", deny: ["VIEW_CHANNEL"], }, { id: data.Destek.RolEkip, type: "ROLE", allow: ["VIEW_CHANNEL"], deny: [], },], })).id;
            await config.updateOne({ _id: data._id }, { Destek: data.Destek });
            await kanal.send({ embeds: [embeddestek], components: [rowdestek] });
            await interaction.reply({ content: `Destek talebi açma mesajı başarıyla gönderildi!`, });
            break;
        }
        case "denetim-kaydı": {
            const kanal = interaction.options.getChannel("kanal");
            if (!kanal.viewable || !interaction.guild.me.permissionsIn(kanal.id).has("SEND_MESSAGES")) return interaction.reply({ content: `Bu kanalda gerekli işlemleri yapmak için iznim yok!`, });
            const data = await config.findOne({ GuildID: interaction.guild.id, });
            if (!data) data = new config({ GuildID: interaction.guild.id, Destek: {}, Komutyetki: false }).save();
            if (!data.Destek) data.Destek = {};
            data.Destek.LogKanalı = kanal.id;
            await config.updateOne({ _id: data._id }, { Destek: data.Destek });
            await interaction.reply({ content: `Destek log kanalı başarıyla ayarlandı!`, });
            break;
        }
        case "kategori": {
            const tür = interaction.options.getString("tür");
            const kanal = interaction.options.getChannel("kanal");
            switch (tür) {
                case "destek-açık-kategori":
                    if (!kanal.viewable) return interaction.reply({ content: `Bu kanalda gerekli işlemleri yapmak için iznim yok!`, });
                    else {
                        const data = await config.findOne({ GuildID: interaction.guild.id, });
                        if (!data) data = new config({ GuildID: interaction.guild.id, Destek: {}, Komutyetki: false }).save();
                        if (!data.Destek) data.Destek = {};
                        data.Destek.AçıkKategori = kanal.id;
                        await config.updateOne({ _id: data._id }, { Destek: data.Destek });
                        await interaction.reply({ content: `Destek açık kategorisi başarıyla ayarlandı!`, });
                    }
                    break;
                case "destek-kapalı-kategori":
                    if (!kanal.viewable) return interaction.reply({ content: `Bu kanalda gerekli işlemleri yapmak için iznim yok!`, });
                    else {
                        const data = await config.findOne({ GuildID: interaction.guild.id, });
                        if (!data) data = new config({ GuildID: interaction.guild.id, Destek: {}, Komutyetki: false }).save();
                        if (!data.Destek) data.Destek = {};
                        data.Destek.KapalıKategori = kanal.id;
                        await config.updateOne({ _id: data._id }, { Destek: data.Destek });
                        await interaction.reply({ content: `Destek kapalı kategorisi başarıyla ayarlandı!`, });
                    }
                    break;
            }
            break;
        }
        case "rol": {
            const tür = interaction.options.getString("tür");
            const rol = interaction.options.getRole("rol");
            switch (tür) {
                case "destek-ekibi-rolü": {
                    const data = await config.findOne({ GuildID: interaction.guild.id, });
                    if (!data) data = new config({ GuildID: interaction.guild.id, Destek: {}, Komutyetki: false }).save();
                    if (!data.Destek) data.Destek = {};
                    data.Destek.RolEkip = rol.id;
                    await config.updateOne({ _id: data._id }, { Destek: data.Destek });
                    await interaction.reply({ content: `Destek ekibi rolü başarıyla ayarlandı!`, });
                    break;
                }
                case "destek-cezalı-rolü": {
                    const data = await config.findOne({ GuildID: interaction.guild.id, });
                    if (!data) data = new config({ GuildID: interaction.guild.id, Destek: {}, Komutyetki: false }).save();
                    if (!data.Destek) data.Destek = {};
                    data.Destek.RolCezalı = rol.id;
                    await config.updateOne({ _id: data._id }, { Destek: data.Destek });
                    await interaction.reply({ content: `Destek cezalı rolü başarıyla ayarlandı!`, });
                    break;
                }
            }
            break;
        }
    }
};
export const help = {
    name: "destek",
    description: "Destek sistemini ayarlamanız için gereken komuttur.",
    type: 1,
    options: [
        {
            name: "denetim-kaydı",
            description: "Destek kanallarını düzenleyin.",
            type: 1,
            options: [{
                name: "kanal",
                description: "Kanalı etiketleyin.",
                required: true,
                type: 7,
                channel_types: [0],
            }],
        },
        {
            name: "kategori",
            description: "Destek kanallarının bulunacağı kategoriyi düzenleyin.",
            type: 1,
            options: [
                {
                    name: "tür",
                    description: "Destek kanallarını düzenler.",
                    required: true,
                    type: 3,
                    choices: [
                        { name: "Destek Açık Kategori", value: "destek-açık-kategori", },
                        { name: "Destek Kapalı Kategori", value: "destek-kapalı-kategori", },
                    ],
                },
                {
                    name: "kanal",
                    description: "Kanalı etiketleyin.",
                    required: true,
                    type: 7,
                    channel_types: [4],
                },
            ],
        },
        {
            name: "rol",
            description: "Destek rollerini düzenleyin.",
            type: 1,
            options: [
                {
                    name: "tür",
                    description: "Destek rollerini düzenler.",
                    required: true,
                    type: 3,
                    choices: [
                        { name: "Destek Ekibi Rolü", value: "destek-ekibi-rolü", },
                        { name: "Destek Cezalı Rolü", value: "destek-cezalı-rolü", },
                    ],
                },
                {
                    name: "rol",
                    description: "Rolü etiketleyin.",
                    required: true,
                    type: 8,
                },
            ],
        },
        {
            name: "gönder",
            description: "Destek mesajını gönderir.",
            type: 1,
            options: [
                {
                    name: "kanal",
                    description: "Kanalı etiketleyin.",
                    required: true,
                    type: 7,
                    channel_types: [0],
                },
            ],
        },
    ],
};