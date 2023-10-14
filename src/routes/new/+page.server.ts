/*
 * Created Date: Tue Oct 10 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

import { CronTime } from 'cron-time-generator';
import { error, redirect } from "@sveltejs/kit";
import { GuildMember, Role, User } from "discord.js";
import { Notification } from "$lib/server/database";
import { TTLMap } from "$lib/ttlmap";
import { validate } from "uuid";
import type { PageServerLoad, Actions } from "./$types";

export const actions: Actions = {
    default: async ({ request }) => {
        // get the form data
        const data = await request.formData();

        // stuff it into an object
        const e = {
            uuid: data.get('uuid'),
            type: data.get('eventType'),
            date: data.get('date'),
            hours: data.get('hours'),
            minutes: data.get('minutes'),
            weekdays: data.getAll('weekdays'),
            title: data.get('title'),
            body: data.get('body')
        };

        // validate the data
        if (!e.uuid || !validate(e.uuid.toString())) {
            throw error(400, 'bad request')
        }
        if (!e.type) {
            throw error(400, 'bad request')
        }
        if (!e.date && !e.weekdays) {
            throw error(400, 'bad request')
        }
        if (e.date === "" && e.weekdays.length === 0) {
            throw error(400, 'bad request')
        }
        if (e.date === "" && e.type === "onetime") {
            throw error(400, 'bad request')
        }
        if (e.weekdays.length === 0 && e.type === "recurring") {
            throw error(400, 'bad request')
        }
        if (!e.hours)  {
            throw error(400, 'bad request')
        }
        if (!e.minutes)  {
            throw error(400, 'bad request')
        }
        if (!e.title || e.title.length === 0) {
            throw error(400, 'bad request')
        }
        if (!e.body || e.body.length === 0) {
            throw error(400, 'bad request')
        }

        // convert server time to local time
        const serverReset = 16; // 1600hrs UTC
        // hours
        const hours = parseInt(e.hours.toString());
        const t = new Date();
        t.setUTCHours(serverReset + hours);
        const localHours = t.getHours();

        // minutes
        const minutes = parseInt(e.minutes.toString());
        t.setUTCMinutes(minutes);

        // generate a UTC string
        let when = t.toUTCString();

        // if the type is recurring, generate a cron string
        if (e.type === "recurring") {
            const wd = Array.from(e.weekdays, (v) => v.toString());
            when = CronTime.onSpecificDaysAt(wd, localHours, minutes);
        }

        // get the record
        const m = new TTLMap()
        const v = m.get(e.uuid.toString())?.interaction
        if (!v) {
            console.log("good request with missing UUID in TTLMap")
            throw error(404, 'event not found');
        }

        // get the channel from the options
        const chan = v.options.getChannel('channel');
        if (!chan) {
            console.log("good request with missing channel from TTL map");
            await v.editReply({
                content: `there was an error processing your request.`,
                components: []
            })
            throw error(500, 'internal server error');
        }

        // get the notify from the options
        const notifyOption = v.options.getMentionable('notify');
        if (!notifyOption) {
            console.log("good request with missing notify from TTL map");
            await v.editReply({
                content: `there was an error processing your request.`,
                components: []
            })
            throw error(500, 'internal server error');
        }

        // get the name of the notification
        let notifyNameString: string;
        if (notifyOption instanceof User || notifyOption instanceof GuildMember) {
            notifyNameString = notifyOption.displayName;
        } else if (notifyOption instanceof Role) {
            notifyNameString = notifyOption.name;
        } else {
            console.log('mentionable was not User|Role|GuildMember')
            await v.editReply({
                content: `there was an error processing your request.`,
                components: []
            })
            throw error(400, 'bad request'); 
        }
        // delete the registration record
        m.delete(e.uuid.toString());
        // create a new Notification
        try {
            await Notification.create({
                body: e.body.toString(),
                channel: chan.id,
                channelName: chan.name,
                createdBy: v.user.id,
                createdByName: v.user.username,
                notify: notifyOption.toString(),
                notifyName: notifyNameString,
                title: e.title.toString(),
                type: e.type.toString(),
                uuid: e.uuid.toString(),
                when: when,
            });
            // inform the scheduler of the new event
            // TBD

            // let the user know
            await v.editReply({
                content: 'Your notification has been scheduled!',
                components: []
            });
        } catch (err) {
            console.error(err);
            await v.editReply({
                content: 'there was an error processing your request.',
                components: []
            });
            throw error(500, 'internal server error')
        }
        // redirect the user on success
        throw redirect(307, `/success?id=${e.uuid.toString()}`);
    }
}

export const load: PageServerLoad = async ({ url }) => {
    const id = url.searchParams.get('id');
    if (!id || !validate(id)) {
        throw error(400, 'bad request');
    }
    const m = new TTLMap();
    const e = m.get(id);
    if (!e) {
        throw error(404, 'not found');
    }
    // give the user 5 minutes to complete
    const expires = m.set_ttl(e.uuid, 300);
    if (!expires) {
        console.log(`interaction ${e.interaction.id} has invalid expires`);
        await e.interaction.editReply({
            content: `there was an error processing your request.`,
            components: []
        })
        throw error(500, 'internal server error' );
    }
    // process the interaction
    const createdBy = e.interaction.user.username;

    const chan = e.interaction.options.getChannel('channel');
    if (!chan) {
        console.log(`interaction ${e.interaction.id} has no channel option`);
        await e.interaction.editReply({
            content: `there was an error processing your request.`,
            components: []
        })
        throw error(500, 'internal server error');
    }
    if (chan.name === null) {
        console.log(`interaction ${e.interaction.id} has no channel name`);
        await e.interaction.editReply({
            content: `there was an error processing your request.`,
            components: []
        })
        throw error(500, 'internal server error');
    }

    const guild = e.interaction.guild?.name;
    if (!guild) {
        console.log(`interaction ${e.interaction.id} has invalid guild`);
        await e.interaction.editReply({
            content: `there was an error processing your request.`,
            components: []
        })
        throw error(500, 'internal server error');
    }

    const mention = e.interaction.options.getMentionable('notify');
    if (!mention) {
        console.log(`interaction ${e.interaction.id} has invalid mentionable`);
        await e.interaction.editReply({
            content: `there was an error processing your request.`,
            components: []
        })
        throw error(500, 'internal server error');
    }

    let mentionString: string;
    if (mention instanceof User) {
        mentionString = mention.username;
    } else if (mention instanceof GuildMember) {
        mentionString = mention.displayName;
    } else if (mention instanceof Role) {
        mentionString = mention.name;
    } else {
        // we don't know what kind of mention this is
        console.log(`interaction ${e.interaction.id} has mentionable of unknown type`);
        await e.interaction.editReply({
            content: `there was an error processing your request.`,
            components: []
        })
        throw error(500, 'internal server error');
    }

    return {
        channelName: chan.name,
        createdBy: createdBy,
        expires: expires.getTime(),
        guildName: guild,
        notify: mentionString,
    }
}