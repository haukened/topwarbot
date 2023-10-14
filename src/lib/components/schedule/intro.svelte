<!--
 * Created Date: Tue Oct 10 2023                                               *
 * Author: David Haukeness david@hauken.us                                     *
 * Copyright (c) 2023 David Haukeness                                          *
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0   *
-->

<script lang="ts">
    export let name: string;
    export let notify: string;
    export let channel: string;
    export let guild: string;
    export let oneTime: ()=>void;
    export let recurring: ()=>void;
    const strippedNotify = notify.replaceAll('@','');
</script>

<div class="p-8 pt-0 text-white prose text-center">
    <h1 class="mt-4 text-white">Hello <span class="font-bold">{name}</span>!</h1>
    <p class="indent-4">Please use this form to finish scheduling your event.</p>
    <div class="flex flex-col mt-2 justify-start sm:justify-center sm:flex-row sm:space-x-1">
        <div class="flex flex-nowrap flex-col items-start sm:items-center">
            <div class="text-xs">Server</div>
            <kbd class="kbd kbd-sm text-white">{guild}</kbd>
        </div>
        <div class="flex flex-col items-start sm:items-center">
            <div class="text-xs">Channel</div>
            <kbd class="kbd kbd-sm text-white">#{channel}</kbd>
        </div>
        <div class="flex flex-col items-start sm:items-center">
            <div class="text-xs">Notifies</div>
            <kbd class="kbd kbd-sm text-white">@{strippedNotify}</kbd>
        </div>
    </div>
    <div class="flex flex-col w-full text-center mt-4 space-y-2">
        <p class="font-bold underline mb-4">What Kind of event is this?</p>
        <div class="flex flex-row justify-around">
            <button class="btn btn-primary" on:click={oneTime}>One Time</button>
            <button class="btn btn-primary" on:click={recurring}>Recurring</button>
        </div>
    </div>
</div>