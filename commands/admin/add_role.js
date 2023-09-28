/*
 * Created Date: Thu Sep 28 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

const { SlashCommandBuilder } = require('discord.js');
const { IsAdmin } = require('./permissions.cjs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription("Allows a role to schedule events.")
        .setDMPermission(false),
    async execute(interaction) {
        if (!IsAdmin(interaction)) {
            await interaction.reply({content: `Oops! You're not an admin. You can't do that.`, ephemeral: true})
            return;
        } else {
            await interaction.reply({content: `Sweet, sweet admin rights.`, ephemeral: true})
        }
        await interaction.followUp('Pong!');
    }
}