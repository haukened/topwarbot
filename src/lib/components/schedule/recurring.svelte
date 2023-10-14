<!--
 * Created Date: Tue Oct 10 2023                                               *
 * Author: David Haukeness david@hauken.us                                     *
 * Copyright (c) 2023 David Haukeness                                          *
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0   *
-->

<script lang="ts">
    import TimeSelect from './time.svelte';

    const sortFilterDays = (days_array: Array<string|undefined>): Array<string> => {
        const days = days_array.filter((item): item is string => !!item);
        const actualOrder = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
        const sortFn = function (a:string, b:string) {
            const aN = actualOrder.indexOf(a.toLowerCase());
            const bN = actualOrder.indexOf(b.toLowerCase());
            return aN < bN ? 0 : 1;
        }
        return days.sort(sortFn);
    }

    let weekdaysList = [
        {value: 'sunday', label: "Sun", checked: false},
        {value: 'monday', label: "Mon", checked: false},
        {value: 'tuesday', label: "Tue", checked: false},
        {value: 'wednesday', label: "Wed", checked: false},
        {value: 'thursday', label: "Thu", checked: false},
        {value: 'friday', label: "Fri", checked: false},
        {value: 'saturday', label: "Sat", checked: false}
    ] 
    $: selectedWeekdays = Array.from(weekdaysList, ({value, label, checked}, k) => {if (checked) return value});

    export let weekdays = sortFilterDays(selectedWeekdays);
    export let hours: number = 0;
    export let minutes: number = 0;
    export let onNext: () => void;
    export let onBack: () => void;

    const handleCheck = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const v = target.value;
        if (target.checked) {
            weekdays.push(v);
        } else {
            let i = 0;
            while (i < weekdays.length) {
                if (weekdays[i] === v) {
                    weekdays.splice(i, 1);
                } else {
                    ++i;
                }
            }
        }
        weekdays.sort();
        console.log(weekdays);
    }
</script>

<div class="p-8 pt-0 w-96 text-white">
    <div class="font-bold text-xl underline">Schedule Event</div>
    <div class="form-control w-full max-w-xs">
        <label for="days" class="label">
            <span class="label-text text-white">Days of the Week</span>
        </label>
        <div class="flex flex-row justify-around input border-neutral">
            {#each weekdaysList as day}
                <div class="flex flex-col items-center">
                    <label for="check-{day.value}" class="label-text text-white">{day.label}</label>
                    <input value={day.value} id="check-{day.value}" type="checkbox" class="checkbox" on:change|preventDefault={handleCheck}/>
                </div>
            {/each}
        </div>
        <TimeSelect bind:hours={hours} bind:minutes={minutes}/>
    </div>
    <div class="flex justify-between mt-4">
        <button class="btn btn-primary" on:click={onBack}>Back</button>
        <button class="btn btn-primary" on:click={onNext}>Next</button>
    </div>
</div>