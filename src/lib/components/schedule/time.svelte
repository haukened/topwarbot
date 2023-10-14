<!--
 * Created Date: Tue Oct 10 2023                                               *
 * Author: David Haukeness david@hauken.us                                     *
 * Copyright (c) 2023 David Haukeness                                          *
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0   *
-->

<script lang="ts">
    const hoursList: number[] = Array.from({length:25}, (v,k)=>k-12);
    const minutesList: number[] = Array.from({length: 60}, (v,k)=>k); 
    export let hours = 0;
    export let minutes = 0;
</script>

<div>
    <label for="time" class="label pb-0">
        <span class="label-text text-white">Event Time</span>
        <span class="label-text-alt">Relative to server reset</span>
    </label>
    <div class="flex flex-row items-center space-x-2">
        <select id="time" bind:value={hours} class="select select-bordered w-full max-w-xs">
            {#each hoursList as hour}
                <option value={hour}>{hour >0 ? "+" : ""}{hour} hours</option>
            {/each}
        </select>
        <select bind:value={minutes} class="select select-bordered w-full max-w-xs my-2">
            {#each minutesList as minute}
                <option value={minute}>{minute} minutes</option>
            {/each}
        </select>
    </div>
</div>