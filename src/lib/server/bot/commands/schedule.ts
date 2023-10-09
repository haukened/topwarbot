/*
 * Created Date: Mon Oct 09 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

import { SlashCommandBuilder } from "discord.js";
import type { CommandInteraction } from "discord.js";

export const scheduleCommand = new SlashCommandBuilder()
    .setName("schedule")
    .setDescription("Schedule a new evernt")
    .setDMPermission(false)

export async function executeSchedule(interaction: CommandInteraction) {
    await interaction.reply({
        content: `Pong!`,
        ephemeral: true
    })
}