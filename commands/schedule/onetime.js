/*
 * Created Date: Thu Sep 28 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

const { SlashCommandBuilder, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalSubmitInteraction } = require('discord.js');
const { CreateNotificationEvent } = require('../../database/sqlite');
const { UTCDate } = require('./utcdate.cjs');
const { Scheduler } = require('../../scheduler');
const TIMEOUT = 30_000;

/**
 * generates Discord timestamps like <t:1629478800>
 * @returns {string} the unix timestamp that discord will parse to local time for the user
 */
Date.prototype.getDiscordTimestamp = function() {
    return `<t:${this.getTime()/1000}>`
}

const scheduler = new Scheduler();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('onetime')
        .setDescription("Schedules a one time event for a future date and time.")
        .setDMPermission(false)
        .addStringOption(option => 
            option.setName('date')
                .setDescription('the date for the event in YYYY/MM/DD format')
                .setMaxLength(10)
                .setMinLength(8)
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('time')
                .setDescription('the relative time from server reset, from -12 to +12 in hours')
                .setMinValue(-12)
                .setMaxValue(12)
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
        ),
    async execute(interaction) {
        // first lets validate and parse all the options
        let when;
        let hours = 0;
        const dateString = interaction.options.getString('date');
        const time = interaction.options.getInteger('time');
        const mention = interaction.options.getMentionable('notify');
        const chan = interaction.options.getChannel('channel');
        try {
            when = newServerResetDate(dateString);
            if (!when.isValid()) {
                await interaction.reply(`unable to parse ${dateString} as a valid date`)
                return;
            }
        } catch {
            await interaction.reply(`unable to parse ${dateString} as a valid date`)
            return;
        }
        try {
            hours = parseTopWarTime(time);
            when.addHours(hours)
        } catch (e) {
            await interaction.reply(`${e}`);
            return;
        }
        // now launch a modal to get the notification body
        const modal = new ModalBuilder()
            .setCustomId('modal-notif')
            .setTitle("Notification Message")
        const note = new TextInputBuilder()
            .setCustomId("input-note")
            .setLabel("Notificaiton Name")
            .setPlaceholder("A notification about...")
            .setMaxLength(200)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        const notif = new TextInputBuilder()
            .setCustomId("input-notif")
            .setLabel("What would you like the notification to say?")
            .setPlaceholder("Type here...")
            .setRequired(true)
            .setMaxLength(1500)
            .setStyle(TextInputStyle.Paragraph);
        const row1 = new ActionRowBuilder().addComponents(note);
        const row2 = new ActionRowBuilder().addComponents(notif);
        modal.addComponents(row1, row2);
        await interaction.showModal(modal);
        const submission = await interaction.awaitModalSubmit({time: TIMEOUT})
        await submission.deferReply({ephemeral: true});
        const modalValues = getModalValues(submission);
        // here we need to add it to the database
        let nEvent = await CreateNotificationEvent(
            modalValues.get('input-notif'), 
            modalValues.get('input-note'),
            interaction.user.id,
            interaction.user.username,
            chan.id,
            mention.id,
        )
        const nOnce = await nEvent.createOnce({
            when: when.toString()
        });
        // then we need to add it to the scheduler
        scheduler.registerOnce(nOnce);
        await submission.editReply({
            content: `Your notification has been scheduled for ${when.toDiscordString()} (reset ${hours>0?"+":"-"} ${Math.abs(hours)} hours).`,
            ephemeral: true,
        })
    }
}

/**
 * grabs customId:value pairs from ModalSubmitInteractions
 * @param {ModalSubmitInteraction} submission 
 * @returns {Map<string,string>}
 */
function getModalValues(submission) {
    const values = new Map();
    for (const outerComp of submission.components) {
        for (const innerComp of outerComp.components) {
            values.set(innerComp.customId, innerComp.value);
        }
    }
    return values;
}

/**
 * parses relative Top War time.
 * @param {string|number} t a string or number indicating an hour offset
 * @returns {number} the offset hours as a integer
 */
function parseTopWarTime(t) {
    const hours = parseInt(t);
    if (isNaN(hours)) {
        throw new Error(`Could not parse ${t} into an integer`);
    }
    if (hours > 12 || hours < -12) {
        throw new Error("Top War time must be between -12 and +12");
    }
    return hours;
}

/**
 * converts a date into server reset on that day
 * @param {string} dateString the user supplied date string
 * @param {number} serverReset (optional) server reset hours [default = 16]
 * @returns {UTCDate}
 */
function newServerResetDate(dateString, serverReset = 16) {
    let when = new UTCDate(dateString);
    when.setHours(serverReset);
    return when
}