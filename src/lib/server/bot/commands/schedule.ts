/*
 * Created Date: Mon Oct 09 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

import { env } from "$env/dynamic/private";
import { TTLEntry, TTLMap } from "$lib/ttlmap";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export const scheduleCommand = new SlashCommandBuilder()
    .setName("schedule")
    .setDescription("Schedule a new evernt")
    .setDMPermission(false)
    .addMentionableOption(option => 
        option.setName('notify')
            .setDescription('who to notify when this event fires')
            .setRequired(true)
        )
    .addChannelOption(option => 
        option.setName('channel')
            .setDescription('what channel to send the notification to')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )

export async function executeSchedule(interaction: ChatInputCommandInteraction) {
    const baseURL = env.DISCORD_BASEURL;
    if (!baseURL) {
        await interaction.reply({
            content: `This application is misconfigured. Please configure the DISCORD_BASEURL environment variable and restart.`,
            ephemeral: true
        })
        return;
    }
    if (interaction.guild === null) {
        await interaction.reply({
            content: `Unable to fetch your guild id.`,
            ephemeral: true
        })
        return;
    }
    const tmap = new TTLMap();
    const data = new TTLEntry(interaction, 300);
    const expires = tmap.set(data.uuid, data);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("Schedule")
        .setURL(baseURL + `/new?id=${data.uuid}`)
    );
    await interaction.reply({
        content: `Please click the link to finish scheduling.  This link expires at ${expires}`,
        components: [row],
        ephemeral: true,
    });
}