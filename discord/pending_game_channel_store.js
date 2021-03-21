
const fs = require("fs");
const path = require("path");
const fsp = require("fs").promises;
const config = require("../config/config.json");
const pathToData = `${config.dataPath}/pending_channels.json`;
var channelsPendingHostingByUserId = {};

if (fs.existsSync(pathToData) === true)
    channelsPendingHostingByUserId = require(path.resolve(__dirname, "../", pathToData));

exports.save = () =>
{
    const jsonData = JSON.stringify(channelsPendingHostingByUserId, null, 2);

    return fsp.writeFile(pathToData, jsonData)
    .then(() =>
    {
        console.log(`Pending channels data saved.`);
        return Promise.resolve();
    })
    .catch((err) => Promise.reject(err));
};

exports.addPendingChannel = (memberId, channelId) =>
{
    if (channelsPendingHostingByUserId[memberId] == null)
        channelsPendingHostingByUserId[memberId] = [];

    channelsPendingHostingByUserId[memberId].push(channelId);

    return exports.save()
    .catch((err) => Promise.reject(err));
};

exports.isChannelPendingHosting = (channelId) =>
{
    for (var memberId in channelsPendingHostingByUserId)
    {
        var userCreatedChannels = channelsPendingHostingByUserId[memberId];

        if (userCreatedChannels.includes(channelId) === true)
            return true;
    }

    return false;
};

exports.removeGameChannelPendingHosting = (channelId) =>
{
    var deleted = false;

    for (var memberId in channelsPendingHostingByUserId)
    {
        var userCreatedChannels = channelsPendingHostingByUserId[memberId];

        userCreatedChannels.forEach((userCreatedChannelId, index, array) =>
        {
            if (channelId === userCreatedChannelId)
            {
                deleted = true;
                array.splice(index, 1);
            }
        });

        if (userCreatedChannels.length <= 0)
            delete channelsPendingHostingByUserId[memberId];
    }

    if (deleted === true)
        return exports.save()
        .catch((err) => Promise.reject(err));

    return Promise.resolve();
};

exports.didMemberCreatePendingChannel = (memberId, channelId) =>
{
    const userCreatedChannels = channelsPendingHostingByUserId[memberId];

    if (userCreatedChannels == null)
        return false;

    for (var i = 0; i < userCreatedChannels.length; i++)
    {
        var createdChannelId = userCreatedChannels[i];

        if (channelId === createdChannelId)
            return true;
    }

    return false;
};