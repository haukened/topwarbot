/*
 * Created Date: Thu Sep 28 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

function IsAdmin(interaction) {
    return interaction.member.permissionsIn(interaction.channel).has("ADMINISTRATOR");
}

module.exports = {
    IsAdmin: IsAdmin
}