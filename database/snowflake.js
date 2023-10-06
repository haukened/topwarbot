/*
 * Created Date: Thu Oct 05 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

const { DataTypes, Utils } = require('sequelize');

/**
 * SNOWFLAKE is a sequelize DataType that stores snowflake IDs as strings to prevent
 * truncation of BIGINT numbers in sqlite3 databases
 */
class SNOWFLAKE extends DataTypes.TEXT {
    toSql() {
        return 'TEXT'
    }
    _stringify(value) {
        return value.toString();
    }

    static parse(value) {
        return parseInt(value);
    }
}

SNOWFLAKE.prototype.key = SNOWFLAKE.key = 'SNOWFLAKE';
DataTypes.SNOWFLAKE = Utils.classToInvokable(SNOWFLAKE);