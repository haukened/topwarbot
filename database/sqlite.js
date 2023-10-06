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
const EventEmitter = require('events');
require('./snowflake');

const sq = new Sequelize(`sqlite:${database_path}`, {logging: false});

const bus = new EventEmitter();
let initialized = false;

function waitForDatabase() {
    const poll = resolve => {
        if(initialized) resolve();
        else setTimeout(_ => poll(resolve), 100);
    };
    return new Promise(poll);
}

/**
 * Initializes the database and syncs modules to storage
 */
async function Sync() {
    console.log("Initializing database");
    await sq.sync();
    initialized = true;
    console.log("Finished syncing database");
}

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
        type: DataTypes.SNOWFLAKE,
        allowNull: false
    },
    guild_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role_id: {
        type: DataTypes.SNOWFLAKE,
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
 * Represents a one time notification Event
 * @param {Date} when The Date of the event
 */
const Once = sq.define("Once", {
    when: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

/**
 * Represents a recurring schedule for an Event
 * @param {string} schedule The cron-like schedule, as a string
 */
const Recurring = sq.define("Recurring", {
    schedule: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

/**
 * Represents a singular event
 * @param {string} body The body of the notification
 * @param {string} note A note about this notification's purpose
 * @param {number} createdById The discord user ID
 * @param {string} createdByName The discord username
 * @param {number} channelId The discord channelId
 * @param {number} notify The snowflake id of the mentionable group to notify
 */
const NotificationEvent = sq.define("Event", {
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    createdById: {
        type: DataTypes.SNOWFLAKE,
        allowNull: false
    },
    createdByName: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    channelId: {
        type: DataTypes.SNOWFLAKE,
        allowNull: false
    },
    notify: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

/**
 * creates a new Database backed NotificationEvent
 * @param {string} body the body of the notification
 * @param {string} note the title/subject of the notification
 * @param {number} createdById the discord user ID
 * @param {string} createdByName the discord username
 * @param {number} channelId the channel ID to send notifications to
 * @param {number} notify the mentionable group to notify
 * @returns {NotificationEvent}
 */
async function CreateNotificationEvent(body, note, createdById, createdByName, channelId, notify) {
    const n = await NotificationEvent.create({
        body: body,
        note: note,
        createdById: createdById,
        createdByName: createdByName,
        channelId: channelId,
        notify: notify
    })
    return n
}

/**
 * removes a NotificationEvent
 * @param {number} id the database id of the event
 * @returns {number} number of rows affected
 */
async function DeleteNotificationEvent(id) {
    const num = await NotificationEvent.destroy({
        where: {
            id: id
        }
    })
    return num
}

/**
 * fetches notification for a guild
 * @param {number} guild_id the discord guild id
 * @returns {Array<NotificationEvent>}
 */
async function ListNotificationEvents(guild_id) {
    const rows = await NotificationEvent.findAll({
        where: {
            guild_id: guild_id
        }
    })
    return rows;
}

// associations
NotificationEvent.hasOne(Once, {onDelete: 'CASCADE'})
NotificationEvent.hasOne(Recurring, {onDelete: 'CASCADE'})
Once.belongsTo(NotificationEvent, {onDelete: 'CASCADE'});
Recurring.belongsTo(NotificationEvent, {onDelete: 'CASCADE'})

module.exports = {
    AddPermission: AddPermission,
    CreateNotificationEvent: CreateNotificationEvent,
    NotificationEvent: NotificationEvent,
    ListAllPermissions: ListAllPermissions,
    ListPermission: ListPermission,
    Once: Once,
    Recurring: Recurring,
    RemovePermission: RemovePermission,
    Sync: Sync,
    waitForDatabase: waitForDatabase,
};