/*
 * Created Date: Wed Sep 27 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */
global.__basedir = __dirname;

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const { token } = require('./config.json');
const { Scheduler } = require('./scheduler');
const { DeployCommands, ClearCommands } = require('./deploy-commands');
const beforeShutdown = require('./before-shutdown');
const { Sync } = require("./database/sqlite");

async function main() {
    await Sync();

    const client = new Client({intents: [GatewayIntentBits.Guilds], disableEveryone: false});

    client.commands = new Collection();
    let commandsToRegister = [];

    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.endsWith('.test.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            // set a new item in the collection with the key as the command name and value as the function
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                commandsToRegister.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] the command at ${filePath} is missing a required "data" or "execute" property`);
            }
        }
    }

    // load scheduler
    const scheduler = new Scheduler(client);
    scheduler.init();

    // register shutdown cleanup
    // this can be run multiple times to perform any additional shutdown tasks
    beforeShutdown(() => scheduler.shutdown());
    beforeShutdown(() => ClearCommands());
    beforeShutdown(() => client.user.setPresence({
        activities: [{
            type: ActivityType.Custom,
            name: 'Offline for Maintenance',
            state: 'Offline for Maintenance'
        }],
        status: 'dnd'
    }))

    // run on startup, one time
    client.once(Events.ClientReady, async c => {
        console.log(`Ready! Logged in as ${c.user.tag}`);
        await DeployCommands(commandsToRegister);
        client.user.setPresence({
            activities: [{
                name: 'Top War',
                type: ActivityType.Playing,
            }],
            status: 'online'
        });
    })

    // run on every interaction. This is essentially an event dispatcher for command handlers
    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({content: 'There was an error while executing this command.', ephemeral: true});
            } else {
                await interaction.reply({content: 'There was an error while executing this command.', ephemeral: true})
            }
        }
    });

    // login and run the application until it quits
    client.login(token);
}

main();