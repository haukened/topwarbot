/*
 * Created Date: Wed Oct 11 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

import { env } from "$env/dynamic/private";
import { DataTypes, Model, type Sequelize } from "sequelize";
import { NewSqliteDB } from './sqlite3';

const db_type = env.DATABASE_DIALECT;
if (!db_type || db_type === '') {
    throw new Error('required ENV variable missing: DATABASE_DIALECT');
}

let db: Sequelize;

export async function waitForDatabase() {
    await db.sync();
}

switch (db_type) {
    case 'sqlite':
        db = NewSqliteDB();
        break;
    default:
        throw new Error(`unsupported database dialect: "${db_type}"`)
}

export class Notification extends Model {
    declare uuid: string;
    declare title: string;
    declare body: string;
    declare createdBy: string;
    declare createdByName: string;
    declare channel: string;
    declare channelName: string;
    declare notify: string;
    declare notifyName: string;
    declare type: string;
    declare when: string;
}

Notification.init({
    // define model attributes
    uuid: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    createdBy: {
        // snowflake IDs are 64 bit integers, which is a 20 digit number, stored as a string
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    createdByName: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    channel: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    channelName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    notify: {
        // format is <@&SNOWFLAKE(20)> = 24
        type: DataTypes.STRING(25),
        allowNull: false
    },
    notifyName: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    type: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            isIn: {
                args: [['onetime', 'recurring']],
                msg: 'must be either onetime or recurring',
            }
        },
    },
    when: {
        type: DataTypes.STRING(30),
        allowNull: false,
    }
}, {
    sequelize: db, // we need to pass the connection
    modelName: 'Notification', // we need to choose the model name
});