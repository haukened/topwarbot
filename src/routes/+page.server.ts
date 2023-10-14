/*
 * Created Date: Wed Oct 11 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

import type { Actions } from "./new/$types";
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
    ack: async ({ cookies }) => {
        cookies.set('ack', 'true', {
            path: '/',
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60
        })
        throw redirect(307, '/');
    }
}