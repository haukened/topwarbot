/*
 * Created Date: Thu Sep 28 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();
const { database } = require('../config.json');

const database_path = path.join(__basedir, database)
const db = new sqlite3.Database(database_path);

db.Init = function() {
    this.run("CREATE TABLE IF NOT EXISTS test (info TEXT);");
}

module.exports = db;