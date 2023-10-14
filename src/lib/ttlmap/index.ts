/*
 * Created Date: Mon Oct 09 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

import { env } from '$env/dynamic/private';
import type { ChatInputCommandInteraction } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';

const _dict = new Map<string,TTLEntry>;

setInterval(() => {
    if (env.NODE_ENV === "development") return;
    for (const [key, value] of _dict) {
        if (value.isExpired()) {
            _dict.delete(key);
        }
    }
}, 1000);

export class Expires extends Date {
    constructor(ttl: number) {
        super();
        this.setSeconds(this.getSeconds() + ttl);
    }

    public toString() {
        return `<t:${Math.floor(this.getTime()/1000)}>`
    }
}

export class TTLEntry {
    readonly uuid: string;
    expires: Expires;
    interaction: ChatInputCommandInteraction;

    constructor(interaction: ChatInputCommandInteraction, ttl: number) {
        this.uuid = uuidv4();
        this.interaction = interaction;
        this.expires = new Expires(ttl);
    }

    isExpired(): boolean {
        return this.expires <= new Date();
    }

    reset_ttl(seconds: number): Expires {
        this.expires = new Expires(seconds);
        return this.expires;
    }
}

export class TTLMap {
    set(key: string, value: TTLEntry): Expires {
        _dict.set(key, value);
        return value.expires;
    }

    get(key: string): TTLEntry|undefined {
        return _dict.get(key);
    }

    delete(key: string): boolean {
        return _dict.delete(key);
    }

    set_ttl(key: string, ttl: number): Expires|null {
        const v = _dict.get(key)
        if (!v) return null;
        const e = v.reset_ttl(ttl);
        _dict.set(v.uuid, v);
        return e
    }
}