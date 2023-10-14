<!--
 * Created Date: Wed Oct 11 2023                                               *
 * Author: David Haukeness david@hauken.us                                     *
 * Copyright (c) 2023 David Haukeness                                          *
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0   *
-->

<script lang="ts">
	import { enhance } from "$app/forms";
	import { error } from "@sveltejs/kit";
    import { validate } from "uuid";
    const search = new URLSearchParams(window.location.search);
    const uuid = search.get('id');
    if (!uuid || !validate(uuid)) {
        throw error(400, 'bad request');
    }

    // data for hidden fields
    export let eventType: string;
    export let date: string;
    export let hours: number;
    export let minutes: number;
    export let weekdays: string[] = [];

    // data for these fields
    export let title: string = "";
    export let body: string = "";
    export let onBack: () => void;
    let maxLen: number = 1800;
    $: currentLen = body.length;
</script>

<div class="p-8 pt-0 w-96 text-white">
    <div class="font-bold text-xl underline">Schedule Event</div>
    <form method="POST" use:enhance>
        <div class="form-control w-full max-w-xs">
            <input hidden id="uuid" name="uuid" type="text" value={uuid}/>
            <input hidden id='eventType' name="eventType" type="text" value={eventType}/>
            <input hidden id='date' name="date" type="date" value={date}/>
            <input hidden id='hours' name='hours' type="number" value={hours}/>
            <input hidden id='minutes' name='minutes' type="number" value={minutes}/>
            {#each weekdays as day}
                <input hidden id="weekday-{day}" name="weekdays" type="text" value={day}/>
            {/each}
            <label for="title" class="label">
                <span class="label-text text-white">Event Name</span>
            </label>
            <input id="title" name="title" type="text" maxlength="30" bind:value={title} placeholder="Enter Name" class="input input-bordered w-full max-w-xs"/>
            <label for="body" class="label">
                <span class="label-text text-white">Notification Text</span>
                <span class="label-text text-{currentLen/maxLen<0.9 ? "white" : "warning"}">{currentLen}/{maxLen} characters</span>
            </label>
            <textarea id="body" name="body" maxlength={maxLen} bind:value={body} class="textarea textarea-bordered h-48" placeholder="Type what you want the bot to send"/>
        </div>
        <div class="flex justify-between mt-4">
            <button class="btn btn-primary" on:click={onBack}>Back</button>
            <input type="submit" class="btn btn-primary" value="Submit"/>
        </div>
    </form>
</div>