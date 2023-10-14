/*
 * Created Date: Mon Oct 09 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

import { DiscordClient } from "$lib/server/bot";
import { waitForDatabase } from "$lib/server/database";

console.log('Waiting for database...');
await waitForDatabase();
console.log('Database initialized');

const client = new DiscordClient();
await client.do_setup();

// shutdown handlers
process.on('SIGINT', client.clear_commands);
process.on('SIGTERM', client.clear_commands);