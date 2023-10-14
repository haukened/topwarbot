<!--
 * Created Date: Tue Oct 10 2023                                               *
 * Author: David Haukeness david@hauken.us                                     *
 * Copyright (c) 2023 David Haukeness                                          *
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0   *
-->

<script lang="ts">
    import TimeSelect from './time.svelte';
    import { isPast } from './utils';

    const getDate = (): string => {
        const d = new Date();
        const year = d.getFullYear().toString();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`
    }

    export let date: string = getDate();
    export let hours: number = 0;
    export let minutes: number = 0;
    export let onNext: () => void;
    export let onBack: () => void;

    $: disabled = isPast(date, hours, minutes);
</script>

<div class="p-8 pt-0 w-96 text-white">
    <div class="font-bold text-xl underline">Schedule Event</div>
    <div class="form-control w-full max-w-xs">
        <label for="date" class="label">
            <span class="label-text text-white">Event Date</span>
        </label>
        <input id="date" type="date" bind:value={date} placeholder="Select a date..." class="input input-bordered w-full max-w-xs"/>
        <TimeSelect bind:hours={hours} bind:minutes={minutes}/>
    </div>
    <div class="flex justify-between mt-4">
        <button class="btn btn-primary" on:click={onBack}>Back</button>
        <button disabled={disabled} class="btn btn-primary" on:click={onNext}>Next</button>
    </div>
</div>