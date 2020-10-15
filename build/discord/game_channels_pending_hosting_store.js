"use strict";
var channelsPendingHostingByUserId = {};
//TODO: code loading pending channels
//TODO: code to delete pending channels once hosted or deleted
exports.isChannelPendingHosting = function (channelId) {
    for (var userId in channelsPendingHostingByUserId) {
        var userCreatedChannels = channelsPendingHostingByUserId[userId];
        if (userCreatedChannels.includes(channelId) === true)
            return true;
    }
    return false;
};
exports.deleteGameChannelPendingHosting = function (channelId) {
    for (var userId in channelsPendingHostingByUserId) {
        var userCreatedChannels = channelsPendingHostingByUserId[userId];
        userCreatedChannels.forEach(function (userCreatedChannelId, index, array) {
            if (channelId === userCreatedChannelId)
                array.splice(iindex, 1);
        });
    }
};
//# sourceMappingURL=game_channels_pending_hosting_store.js.map