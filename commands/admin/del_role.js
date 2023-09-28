/*
 * Created Date: Thu Sep 28 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delrole')
        .setDescription("Removes a previously allowed role to schedule events.")
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.reply('Pong!');
    }
}