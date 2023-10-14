/*
 * Created Date: Wed Oct 11 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

import { env } from "$env/dynamic/private";
import { Sequelize } from "sequelize";
const path = env.SQLITE_PATH;
if (!path || path === "") {
    throw new Error('required ENV variable missing: SQLITE_PATH');
}

export const NewSqliteDB = () => {
    return new Sequelize({
        dialect: 'sqlite',
        storage: path
    })
}

