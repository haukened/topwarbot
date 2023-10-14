/*
 * Created Date: Mon Oct 09 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

import { env } from '$env/dynamic/private';
import { Client, Events, GatewayIntentBits, REST, Routes, type SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { scheduleCommand, executeSchedule } from './commands/schedule';

export class DiscordClient extends Client {
    #token: string|undefined = env.DISCORD_TOKEN;
    #appid: string|undefined = env.DISCORD_APPID;
    #guild: string|undefined = env.DISCORD_GUILD;
    #functions = new Map<string,(interaction: ChatInputCommandInteraction)=>Promise<void>>;
    #commands = new Map<string,Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">>;

    constructor() {
        // set up the base client class
        super({intents: [GatewayIntentBits.Guilds]});
        // make sure the require ENV vars are present
        
        // load our bot commands
        this.#functions.set(scheduleCommand.name, executeSchedule);
        this.#commands.set(scheduleCommand.name, scheduleCommand);
        // set up ready handlers
        this.once(Events.ClientReady, c => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
        })
        // set up interaction handler
        this.on(Events.InteractionCreate, async interaction => {
            // only handle text commands
            if (!interaction.isChatInputCommand()) return;
            // get this command
            const command = this.#functions.get(interaction.commandName);
            // make sure its valid
            if (!command) {
                console.error(`no command matching ${interaction.commandName} was found`);
                return;
            }
            // try and execute it
            try {
                await command(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({
                        content: `There was an error while executing this command.`,
                    })
                } else {
                    await interaction.reply({
                        content: `There was an error while executing this command.`,
                        ephemeral: true
                    })
                }
            }
        });
    }

    async do_setup() {
        this.loginFromENV();
        await this.register_commands();
    }

    loginFromENV() {
        if (this.#token === '' || this.#token === null) {
            throw new Error('DISCORD_TOKEN env variable is not set or empty');
        }
        this.login(this.#token);
    }

    getRoute(): `/${string}` {
        if (this.#appid === undefined) {
            throw new Error("missing required environment variable DISCORD_APPID");
        }

        if (env.NODE_ENV === "development") {
            if (this.#guild === undefined) {
                throw new Error("missing required environment variable DISCORD_GUILD");
            }
            return Routes.applicationGuildCommands(this.#appid, this.#guild)
        }

        return Routes.applicationCommands(this.#appid);
    }

    async register_commands() {
        console.log('Registering discord slash commands');
        const route = this.getRoute();
        const cmds: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

        if (this.#token === undefined) {
            throw new Error("missing required environment variable DISCORD_TOKEN");
        }

        this.#commands.forEach((value) => {
            cmds.push(value.toJSON());
        })

        const rest = new REST().setToken(this.#token);

        try {
            await rest.put(
                route,
                { body: cmds }
            )
        } catch (error) {
            console.error(error);
        }
        console.log(`Registered ${cmds.length} commands`)
    }

    async clear_commands() {
        console.log('Clearing discord slash commands');
        const route = this.getRoute();
        if (this.#token === undefined) {
            throw new Error("missing required environment variable DISCORD_TOKEN");
        }
        const rest = new REST().setToken(this.#token);
        try {
            await rest.put(
                route,
                { body: [] }
            )
        } catch (error) {
            console.error(error);
        }
    }
}