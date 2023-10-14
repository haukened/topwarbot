/*
 * Created Date: Tue Oct 10 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));