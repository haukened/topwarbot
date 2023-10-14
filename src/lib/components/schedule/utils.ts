/*
 * Created Date: Wed Oct 11 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

export const isPast = (date: string, hours: number, minutes: number): boolean => {
    const now = new Date();
    const then = new Date(date);
    then.setUTCHours(16 + hours);
    then.setUTCMinutes(minutes);
    return then < now;
}