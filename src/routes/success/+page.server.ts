/*
 * Created Date: Thu Oct 12 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

import { validate } from "uuid";
import type { PageServerLoad } from "../$types";
import { error } from "@sveltejs/kit";
import { Notification } from "$lib/server/database";

export const load: PageServerLoad = async ({ url }) => {
    const id = url.searchParams.get('id');
    if (!id || !validate(id)) {
        throw error(400, 'bad request');
    }
    const n = await Notification.findOne({
        where: {
            uuid: id,
        }
    })
    if (!n) {
        throw error(404, 'not found')
    }
    return {event: n.get({plain: true})}
}