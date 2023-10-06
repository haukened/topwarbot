/*
 * Created Date: Thu Sep 28 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { CreateNotificationEvent } = require('../../database/sqlite');
const { Scheduler } = require('../../scheduler');
const parseDuration = require('parse-duration');

/**
 * generates Discord timestamps like <t:1629478800>
 * @returns {string} the unix timestamp that discord will parse to local time for the user
 */
Date.prototype.getDiscordTimestamp = function() {
    return `<t:${Math.floor(this.getTime()/1000)}>`
}

const scheduler = new Scheduler();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quick')
        .setDescription("Schedules a one time event for a future date and time.")
        .setDMPermission(false)
        .addStringOption(option => 
            option.setName('in')
                .setDescription('a time interval, for example 5m or 1h')
                .setRequired(true)
        )
        .addChannelOption(option => 
            option.setName("channel")
                .setDescription('the channel to send the notification to')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addMentionableOption(option => 
            option.setName("notify")
                .setDescription('the mentionable role to tag in the notification')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("text")
            .setDescription('what you want the notification to say')
            .setRequired(true)
            .setMaxLength(1500)
        ),
    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});
        const now = new Date();
        const intervalString = interaction.options.getString('in');
        const durationMs = parseDuration(intervalString);
        if (durationMs === null) {
            await interaction.editReply({
                content: `${intervalString} is not a valid time duration`,
                ephemeral: true
            })
            return;
        }
        const when = new Date(now.getTime() + durationMs);
        const mention = interaction.options.getMentionable('notify');
        const chan = interaction.options.getChannel('channel');
        const body = interaction.options.getString('text');
        // create a new Event
        let nEvent = await CreateNotificationEvent(
            body, 
            `quick-${now.getTime()/1000}`,
            interaction.user.id,
            interaction.user.username,
            chan.id,
            mention.toString()
        )
        const nOnce = await nEvent.createOnce({
            when: when.toString()
        });
        // then we need to add it to the scheduler
        scheduler.registerOnce(nOnce);
        // reply to the user
        await interaction.editReply({
            content: `Your notification has been scheduled for ${when.getDiscordTimestamp()}`,
            ephemeral: true,
        })
    }
}