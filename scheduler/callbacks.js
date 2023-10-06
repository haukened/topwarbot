/*
 * Created Date: Thu Oct 05 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

const { Client } = require("discord.js");
const { Once, NotificationEvent } = require("../database/sqlite");

/**
 * generates a discord mention tag
 * @param {number} mentionable the discord ID
 * @returns {string} in format <@&{ID}>
 */
function generateDiscordMention(mentionable) {
    return `<@&${mentionable}>`
}

/**
 * callback handler for a scheduled Once
 * @param {Client} client the discordjs client
 * @param {number} id the database ID of the once
 */
async function runOnce(client, id) {
    // first fetch the Once
    const nOnce = await Once.findOne({
        where: {
            id: id,
        }
    })
    if (nOnce === undefined) {
        return;
    }
    // then get the associated event
    const nEvent = await nOnce.getEvent();
    if (nEvent === undefined) {
        return;
    }
    // then send the notification to the channel
    const msg = `${nEvent.notify} - ${nEvent.body}`;
    const chan = await client.channels.fetch(nEvent.channelId);
    await chan.send(msg);
    // now delete the Once and the Event
    // deleting the event should suffice because the Once belongs to the noticiation
    // and has onDelete: 'CASCADE'
    const num_deleted = await NotificationEvent.destroy({
        where: {
            id: nEvent.id,
        }
    });
    console.log(`runOnce deleted ${num_deleted} rows`);
}

module.exports = {
    runOnce: runOnce,
}