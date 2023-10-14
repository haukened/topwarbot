<!--
 * Created Date: Thu Oct 12 2023                                               *
 * Author: David Haukeness david@hauken.us                                     *
 * Copyright (c) 2023 David Haukeness                                          *
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0   *
-->

<script lang="ts">
    import cronstrue from 'cronstrue';
    import type { PageData } from "./$types";
    export let data: PageData;
    const n = data.event;
    let when: string;
    if (n.type === 'onetime') {
        when = new Date(n.when).toString();
    } else {
        // cron string
        when = cronstrue.toString(n.when);
    }
</script>

<div class="card glass w-96 p-2 text-white space-y-4">
    <span class="font-bold text-4xl text-center underline">Awesome!</span>
    <span class="font-bold text-lg text-center">Your notification has been scheduled:</span>
    <div class="overflow-x-auto">
        <table class="table">
            <tbody>
                <tr>
                    <th>Title</th>
                    <td>{n.title}</td>
                </tr>
                <tr>
                    <th>Created By</th>
                    <td>@{n.createdByName}</td>
                </tr>
                <tr>
                    <th>Channel</th>
                    <td>#{n.channelName}</td>
                </tr>
                <tr>
                    <th>Notifies</th>
                    <td>@{n.notifyName}</td>
                </tr>
                <tr>
                    <th>When</th>
                    <td>{when}</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
<div class="mt-8 card glass p-4">
    {JSON.stringify(n, null, 2)}
</div>