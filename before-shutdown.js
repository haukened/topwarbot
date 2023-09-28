/*
 * Created Date: Thu Sep 28 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

/**
 * Signals to catch
 * @const {string[]}
 */
const SHUTDOWN_SIGNALS = ['SIGINT', 'SIGTERM'];

/**
 * Time in milliseconds to wait before forcing shutdown
 * @const {number}
 */
const TIMEOUT = 15000;

/**
 * A queue of listener callbacks to execute before shutting down
 * @type {BeforeShutdownListener[]}
 */
const shutdownListeners = [];

/**
 * Listn for signals and execute given `fn` function once.
 * @param {string[]} signals Systems signals to listen to
 * @param {function (string)} fn Function to execute on shutdown.
 */
const processOnce = (signals, fn) => {
    return signals.forEach(sig => process.once(sig, fn));
}

/**
 * Sets a forced shutdown mechanism that will exit the process after `timeout` milliseconds.
 * @param {number} timeout Time to wait before forcing shutdown (milliseconds)
 */
const forceExitAfter = timeout => () => {
    setTimeout(() => {
        console.warn(`Could not close resources gracefully after ${timeout}ms: forcing shutdown`);
        return process.exit(1);
    }, timeout).unref();
};

/**
 * Main process shutdown handler. Will invoke every previously registeres async shutdown listener
 * in the queue and exit with a code of `0`. Any `Promise` rejections from any listener will
 * be logged out as a warning, but won't prevent other callbacks from executing.
 * @param {string} signalOrEvent The exit signal or event name recieved on the process.
 */
async function shutdownHandler(signalOrEvent) {
    console.warn(`Shutting down: recieved [${signalOrEvent}] signal`);

    for (const listener of shutdownListeners) {
        try {
            await listener(signalOrEvent);
        } catch (error) {
            console.warn(`A shutdown handler failed before completing with ${error.message || error}`);
        }
    }

    return process.exit(0);
}

/** 
 * Registers a new shutdown listener to be invoked before exiting
 * the main process. Listener handlers are guaranteed to be called in the order
 * they were registered.
 * @param {BeforeShutdownListener} listener The shutdown listener to register
 * @returns {BeforeShutdownListener} Echoes back the supplied `listener`.
 */
function beforeShutdown(listener) {
    shutdownListeners.push(listener);
    return listener;
}

// Register shutdown callback that kills the process after `SHUTDOWN_TIMEOUT` milliseconds
// This prevents custom shutdown handlers from hanging the process forever.
processOnce(SHUTDOWN_SIGNALS, forceExitAfter(TIMEOUT));

// Register process shutdown callback
// will listen to incoming signal events and execute all registered handlers in the stack
processOnce(SHUTDOWN_SIGNALS, shutdownHandler);

module.exports = beforeShutdown;