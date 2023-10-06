/*
 * Created Date: Wed Oct 04 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

const { UTCDate, __testing } = require('./utcdate.cjs');
const shouldDate = [2023, 10, 31];
const shouldTimestamp = 1698710400 * 1000; // js uses ms so multiply ts by 1000
const shouldOneHourLater = 1698714000 * 1000;
const shouldOneHourEarlier = 1698706800 * 1000;
const halloween = "2023/10/31";

test("Sanity check", () => {
    expect(true).toBe(true);
})

test("parseDateString year first", () => { 
    expect(__testing.parseDateString("2023/10/31")).toStrictEqual(shouldDate);
})

test("parseDateString year last", () => {
    expect(__testing.parseDateString("10/31/2023")).toStrictEqual(shouldDate);
});

test("parseDateString hyphens", () => {
    expect(__testing.parseDateString("10-31-2023")).toStrictEqual(shouldDate);
})

test("parseDateString periods", () => {
    expect(__testing.parseDateString("10.31.2023")).toStrictEqual(shouldDate);
})

test("parseDateString double backslash", () => {
    expect(__testing.parseDateString("10\\31\\2023")).toStrictEqual(shouldDate);
})

test("parseDateString single digits", () => {
    const should = [1970, 1, 2]
    expect(__testing.parseDateString("1/2/1970")).toStrictEqual(should);
})

test("parseDateString two digit year", () => {
    const errMsg = `unable to parse '10/31/23' as a date. are you missing a 4 digit year?`;
    expect(() => {__testing.parseDateString("10/31/23")}).toThrow(errMsg);
})

test("blank UTCDate is epoch", () => {
    const d = new UTCDate();
    expect(d.getTime()).toBe(0);
})

test("zero UTCDate is zero", () => {
    const d = new UTCDate(0);
    expect(d.getTime()).toBe(0);
})

test("halloween UTCDate is correct", () => {
    const d = new UTCDate(halloween);
    expect(d.getTime()).toBe(shouldTimestamp);
})

test("timestamp is timestamp", () => {
    const d = new UTCDate(shouldTimestamp);
    expect(d.getTime()).toBe(shouldTimestamp);
})

test("adding hour adds one hour", () => {
    const d = new UTCDate(halloween);
    d.addHours(1);
    expect(d.getTime()).toBe(shouldOneHourLater);
})

test("string representation is correct", () => {
    const d = new UTCDate(halloween);
    expect(d.toString()).toBe("Tue, 31 Oct 2023 00:00:00 GMT");
})

test("discord representation is correct", () => {
    const d = new UTCDate(halloween);
    expect(d.toDiscordString()).toBe("<t:1698710400>")
})

test("set positive hours", () => {
    const d = new UTCDate(halloween);
    d.setHours(1); // sets hours to 01:00Z;
    expect(d.getTime()).toBe(shouldOneHourLater);
})

test("set negative hours", () => {
    const d = new UTCDate(halloween);
    d.setHours(-1); // sets to 23:00 hours
    expect(d.getTime()).toBe(shouldOneHourEarlier);
})

test("add positive hours", () => {
    const d = new UTCDate(halloween);
    d.addHours(0.5);
    d.addHours(0.5);
    expect(d.getTime()).toBe(shouldOneHourLater);
})

test("add negative hours", () => {
    const d = new UTCDate(halloween);
    d.addHours(-0.5);
    d.addHours(-0.5);
    expect(d.getTime()).toBe(shouldOneHourEarlier);
})

test("add positive and negative hours", () => {
    const d = new UTCDate(halloween);
    d.addHours(1);
    d.addHours(-1);
    expect(d.getTime()).toBe(shouldTimestamp);
})

test("valid date is valid", () => {
    const d = new UTCDate(halloween);
    expect(d.isValid()).toBe(true);
})