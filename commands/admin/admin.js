/*
 * Created Date: Thu Sep 28 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function IsAdmin(interaction) {
    return interaction.member.permissionsIn(interaction.channel).has("ADMINISTRATOR");
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription("Change admin options")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription("allow a role to use the bot")
                .addRoleOption(option => 
                    option.setName('role')
                    .setDescription('the role to add')
                    .setRequired(true)
                    )
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('remove a role form using the bot')
                .addRoleOption(option => 
                    option.setName('role')
                    .setDescription('the role to remove')
                    .setRequired(true)
                    )
            ),
    async execute(interaction) {
        if (!IsAdmin(interaction)) {
            await interaction.reply({content: `Oops! You're not an admin. You can't do that.`, ephemeral: true})
            return;
        }
        const role = interaction.options.getRole('role');
        const subcmd = interaction.options.getSubcommand();
        await interaction.reply({
            content: `Ok, i will ${subcmd} the role ${role.name}`,
            ephemeral: true
        })
    }
};