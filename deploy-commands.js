/*
 * Created Date: Wed Sep 27 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

const { REST, Routes } = require('discord.js');
const { client_id, token, dev_guild } = require('./config.json');

const IS_DEV = () => {
    if ( process.env.NODE_ENV === "development") {
        return true
    } else {
        return false
    }
}

async function DeployCommandsGlobal(commands) {
    const rest = new REST().setToken(token);
    try {
        console.log(`started refreshing ${commands.length} slash commands.`);

        const data = await rest.put(
            Routes.applicationCommands(client_id),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} slash commands.`);
    } catch (error) {
        console.error(error);
    }
}

async function DeployCommandsGuild(commands) {
    const rest = new REST().setToken(token);
    try {
        console.log(`started refreshing ${commands.length} guild commands.`)
        const data = await rest.put(
            Routes.applicationGuildCommands(client_id, dev_guild),
            { body: commands },
        );
        console.log(`Successfully reloaded ${data.length} guild commands.`)
    } catch (error) {
        console.error(error);
    }
}

// store the export in an object so we can change it on the fly
const mode = {};
module.exports = mode;
// then determine if we're in development mode and export the dev one if we are.
mode.DeployCommands = IS_DEV() ? DeployCommandsGuild : DeployCommandsGlobal;