<!--
 * Created Date: Tue Oct 10 2023                                               *
 * Author: David Haukeness david@hauken.us                                     *
 * Copyright (c) 2023 David Haukeness                                          *
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0   *
-->

<script lang="ts">
    import type { PageData } from "./$types";
    import { Countdown, ScheduleEvent, ScheduleIntro, ScheduleOneTime, ScheduleRecurring } from "$lib/components";

    export let data: PageData;

    let step: number = 1;
    let eventType: string = "";
    let hours = 0;
    let minutes = 0;
    let date: string;
    let weekdays: string[] = [];
    let title: string;
    let body: string;

    const oneTime = () => {
        eventType = "onetime";
        step++;
    }

    const recurring = () => {
        eventType = "recurring";
        step++
    }

    const stepBack = () => {
        if (step === 1) return;
        if (step === 2) eventType = "";
        step--;
    }

    const stepForward = () => {
        if (step === 3) return;
        step++;
    }
</script>


<div class="card m-6 w-96 glass">
    <span class="mt-2 mr-2 place-self-end text-white">Time Remaining: <div class="badge badge-primary"><Countdown timestamp={data.expires}/></div></span>
    {#if step === 1}
        <ScheduleIntro 
            name={data.createdBy} 
            notify={data.notify} 
            channel={data.channelName} 
            guild={data.guildName} 
            oneTime={oneTime} 
            recurring={recurring}
        />
    {:else if step === 2}
        {#if eventType === "onetime"}
            <ScheduleOneTime 
                bind:date={date} 
                bind:hours={hours} 
                bind:minutes={minutes} 
                onBack={stepBack} 
                onNext={stepForward}
            />
        {:else}
            <ScheduleRecurring 
                bind:hours={hours} 
                bind:minutes={minutes} 
                bind:weekdays={weekdays} 
                onBack={stepBack} 
                onNext={stepForward}
            />
        {/if}
    {:else if step === 3}
        <ScheduleEvent 
            onBack={stepBack} 
            bind:title={title} 
            bind:body={body} 
            eventType={eventType} 
            date={date} 
            hours={hours} 
            minutes={minutes}
            weekdays={weekdays}
        />
    {/if}
</div>