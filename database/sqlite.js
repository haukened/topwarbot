/*
 * Created Date: Thu Sep 28 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

const path = require('node:path');
const { database } = require('../config.json');
const database_path = path.join(__basedir, database)
const { Sequelize, DataTypes } = require('sequelize');

const sq = new Sequelize(`sqlite:${database_path}`, {logging: false});

/**
 * Initializes the database and syncs modules to storage
 */
console.log("Initializing database")
sq.sync({alter: true})

/**
 * @typedef {object} Permission
 * @property {number} guild_id The discord guild ID
 * @property {string} guild_name The discord guild name
 * @property {number} role_id The discord role ID
 * @property {string} role_name The discord role name
 * @property {string} command The command granted in this permission
 */
const Permission = sq.define('Permission', {
    guild_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    guild_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    role_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    command: {
        type: DataTypes.STRING,
        allowNull: false
    },
})

/**
 * This adds a permissions entry into the database
 * @param {number} guild_id The discordjs guild id
 * @param {string} guild_name The guild name
 * @param {number} role_id  The discordjs role id
 * @param {string} role_name The role name
 * @param {string} command The command to issue permission to
 * @returns {Permission} Echoes back the created permission as an object.
 */
async function AddPermission(guild_id, guild_name, role_id, role_name, command) {
    const perm = await Permission.create({
        guild_id: guild_id,
        guild_name: guild_name,
        role_id: role_id,
        role_name: role_name,
        command: command
    })
    return perm;
}

/**
 * This removes a permission entry from the database, if it exists
 * @param {number} guild_id The discord guild ID
 * @param {number} role_id The discord role ID
 * @param {string} command The command to remove permissions for
 * @returns {Promise<number>} The number of entries deleted
 */
async function RemovePermission(guild_id, role_id, command) {
    const numDeleted = await Permission.destroy({
        where: {
            guild_id: guild_id,
            role_id: role_id,
            command: command
        }
    })
    return numDeleted
}

/**
 * This fetches all existing permissions for the guild
 * @param {number} guild_id The discordjs guild id
 * @returns {Array.<Permission>} The list of all permissions for this guild
 */
async function ListAllPermissions(guild_id) {
    const perms = await Permission.findAll({
        where: {
            guild_id: guild_id
        }
    })
    return perms
}

/**
 * This fetches all entries for a single permission for the guild
 * @param {number} guild_id The discord guild ID
 * @param {string} permission The permission to filter results by
 * @returns {Array.<Permission>} The list of all instances of this permission for this guild
 */
async function ListPermission(guild_id, permission) {
    const perms = await Permission.findAll({
        where: {
            guild_id: guild_id,
            permission: permission
        }
    })
    return perms
}

/**
 * Represents a singular event
 * @param {string} body The body of the notification
 * @param {number} createdBy The discord user ID
 * @param {string} note A handy note used in the reminder 
 */
const Event = sq.define("Event", {
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    channel_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    everyone: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    role: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    remind_role: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    remind_time: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    remind_channel: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
})

module.exports = {
    AddPermission: AddPermission,
    Event: Event,
    ListAllPermissions: ListAllPermissions,
    ListPermission: ListPermission,
    RemovePermission: RemovePermission,
};