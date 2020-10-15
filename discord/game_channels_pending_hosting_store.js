
const channelsPendingHostingByUserId = {};

//TODO: code loading pending channels
//TODO: code to delete pending channels once hosted or deleted

exports.isChannelPendingHosting = (channelId) =>
{
    for (var userId in channelsPendingHostingByUserId)
    {
        var userCreatedChannels = channelsPendingHostingByUserId[userId];

        if (userCreatedChannels.includes(channelId) === true)
            return true;
    }

    return false;
};

exports.deleteGameChannelPendingHosting = (channelId) =>
{
    for (var userId in channelsPendingHostingByUserId)
    {
        var userCreatedChannels = channelsPendingHostingByUserId[userId];

        userCreatedChannels.forEach((userCreatedChannelId, index, array) =>
        {
            if (channelId === userCreatedChannelId)
                array.splice(iindex, 1);
        });
    }
};