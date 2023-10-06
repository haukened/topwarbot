/*
 * Created Date: Thu Oct 05 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

const { Client } = require("discord.js");
const { Once, waitForDatabase } = require("../database/sqlite");
const schedule = require('node-schedule');
const { runOnce } = require("./callbacks");

// singletons to be shared between instances
let onceJobs = new Map();
let discordClient;
let initialized = false;

/**
 * Scheduler loads and runs recurring jobs
 */
class Scheduler { 
    /**
     * creates en instance of scheduler
     * @param {Client} client 
     */
    constructor(client = undefined) {
        if (client !== undefined) {
            discordClient = client;
        }
    }

    /**
     * needs to be called at least once to ensure all jobs are scheduled
     */
    async init() {
        if (initialized) {
            console.log('scheduler already initialized.');
            return;
        }
        console.log("initializing scheduler");
        await this.loadOnces();
        initialized = true;
    }

    /**
     * register a once with the job scheduler
     * @param {Once} once the once to register
     */
    registerOnce(once, log=true) {
        const job = schedule.scheduleJob(once.id.toString(), once.when, async () => runOnce(discordClient, once.id));
        onceJobs.set(once.id, job);
        if (log) {
            console.debug(`scheduler: new one time job at ${once.when} scheduled`);
        }
    }

    /**
     * remove a previously scheduled job
     * @param {Once} once the once to unregister
     */
    cancelOnce(once) {
        const job = onceJobs.get(once.id);
        job.cancel();
        onceJobs.delete(once.id);
    }

    async loadOnces() {
        // wait for the databse to be available
        await waitForDatabase();
        // get all the onces
        const onces = await Once.findAll();
        if (onces.length === 0) {
            console.log("scheduler registered 0 onces");
            return;
        }
        let num_jobs = 0;
        for (const once of onces) {
            this.registerOnce(once, false);
            num_jobs++;
        }
        console.log(`scheduler registered ${num_jobs} one time jobs`)
    }

    async shutdown() {
        console.log("scheduler: attempting to terminate all jobs.");
        await schedule.gracefulShutdown();
        console.log("scheduler: all jobs gracefully cancelled.");
    }
}

module.exports = {
    Scheduler: Scheduler,
}