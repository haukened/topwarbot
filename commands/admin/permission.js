/*
 * Created Date: Thu Sep 28 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { AddPermission, ListAllPermissions, ListPermission, RemovePermission } = require('../../database/sqlite');

function IsAdmin(interaction) {
    return interaction.member.permissionsIn(interaction.channel).has("ADMINISTRATOR");
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('permission')
        .setDescription("Grant access to bot commands")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription("allow a role to use a command")
                .addRoleOption(option => 
                    option.setName('role')
                    .setDescription('the role to add')
                    .setRequired(true)
                )
                .addStringOption(option => 
                    option.setName('command')
                    .setDescription("the command to add")
                    .setRequired(true)
                    .addChoices(
                        { name: "schedule", value: "schedule"},
                    )
                )
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('disallow a role to use a command')
                .addRoleOption(option => 
                    option.setName('role')
                    .setDescription('the role to remove permissions from')
                    .setRequired(true)
                )
                .addStringOption(option => 
                    option.setName('command')
                    .setDescription('the command to remove')
                    .setRequired(true)
                    .addChoices(
                        { name: "schedule", value: "schedule"},
                    )
                )
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('see what groups are allowed to use the bot')
                .addStringOption(option => 
                    option.setName('command')
                    .setDescription('filter to a specific command')
                    .setRequired(false)
                    .addChoices(
                        { name: "schedule", value: "schedule"},
                    )
                )
            ),
    async execute(interaction) {
        if (!IsAdmin(interaction)) {
            await interaction.reply({content: `Oops! You're not an admin. You can't do that.`, ephemeral: true})
            return;
        }
        const role = interaction.options.getRole('role');
        const permCmd = interaction.options.getString('command');
        const subcmd = interaction.options.getSubcommand();
        // do the thing here
        switch (subcmd) {
            case "add": {
                await AddPermission(
                    interaction.guild.id,
                    interaction.guild.name,
                    role.id,
                    role.name,
                    permCmd
                );
                await interaction.reply({content: `${role.name} can now use ${permCmd}`, ephemeral: true})
                return;
            }
            case "list": {
                let perms = [];
                const cmdFilter = interaction.options.getString('command')
                if (cmdFilter !== "") {
                    perms = await ListAllPermissions(interaction.guild.id);
                } else {
                    perms = await ListPermission(interaction.guild.id, cmdFilter);
                }
                let results = [];
                perms.map((perm) => {
                    results.push(`@${perm.role_name} can use ${perm.command}`);
                })
                await interaction.reply({content: results.join("\n"), ephemeral: true});
                return;
            }
            case "delete": {
                const numDelete = await RemovePermission(interaction.guild.id, role.id, permCmd);
                await interaction.reply({content: `Removed ${numDelete} permissions from @${role.name}`, ephemeral: true});
                return;
            }
        }
    }
};