<!--
 * Created Date: Tue Oct 10 2023                                               *
 * Author: David Haukeness david@hauken.us                                     *
 * Copyright (c) 2023 David Haukeness                                          *
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0   *
-->

<script lang="ts">
    export let timestamp: number;
    export let suffix: string|undefined = undefined;
    let seconds = Math.floor((timestamp - new Date().getTime())/1000);

    const decr = () => {
        if (seconds <= 0) return;
        seconds-=1;
    }

    let clear: NodeJS.Timeout;
    let formatted: string;
    $: {
        clearInterval(clear);
        formatted = `${(Math.floor(seconds/3600)).toString().padStart(2, '0')}:${(Math.floor(seconds/60)).toString().padStart(2, '0')}:${(seconds%60).toString().padStart(2, '0')}`
        clear = setInterval(decr, 1000);
    }
</script>

<div>{formatted}{suffix ? suffix : ""}</div>