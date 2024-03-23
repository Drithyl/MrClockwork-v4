const client = require("./client");
const { ChannelType, PermissionFlagsBits } = require("discord.js");
const ChannelCreateOptionsBuilder = require("./prototypes/channel_create_options_builder");
const RoleCreateOptionsBuilder = require("./prototypes/role_create_options_builder");

class GuildSetup
{
    static newsChannelOptions(guildId)
    {
        const builder = new ChannelCreateOptionsBuilder()
            .setName("clockwork_news")
            .setType(ChannelType.GuildText)
            .setPermissions([
                {
                    id: client.botId,
                    allow: [
                        PermissionFlagsBits.UseExternalEmojis,
                        PermissionFlagsBits.MentionEveryone,
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.AttachFiles
                    ]
                },
                {
                    id: guildId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.CreatePublicThreads
                    ],
                    deny: [
                        PermissionFlagsBits.UseExternalEmojis,
                        PermissionFlagsBits.MentionEveryone,
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.AttachFiles
                    ]
                }
            ]);
        
        return builder.build();
    }

    static helpChannelOptions(guildId)
    {
        const builder = new ChannelCreateOptionsBuilder()
            .setName("clockwork_help")
            .setType(ChannelType.GuildText)
            .setPermissions([
                {
                    id: client.botId,
                    allow: [
                        PermissionFlagsBits.UseExternalEmojis,
                        PermissionFlagsBits.MentionEveryone,
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.AttachFiles
                    ]
                },
                {
                    id: guildId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.ReadMessageHistory
                    ],
                    deny: [
                        PermissionFlagsBits.UseExternalEmojis,
                        PermissionFlagsBits.MentionEveryone,
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.AddReactions
                    ]
                }
            ]);
        
        return builder.build();
    }

    static gameChannelOptions(gameName, organizerId, parentCategory)
    {
        const builder = new ChannelCreateOptionsBuilder()
            .setName(gameName)
            .setType(ChannelType.GuildText)
            .setParent(parentCategory)
            .setPermissions([
                {
                    id: client.botId,
                    allow: [
                        PermissionFlagsBits.UseExternalEmojis,
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.AttachFiles
                    ]
                },
                {
                    id: organizerId,
                    allow: [
                        PermissionFlagsBits.ManageMessages
                    ]
                }
            ]);
        
        return builder.build();
    }

    static recruitingCategoryOptions()
    {
        const builder = new ChannelCreateOptionsBuilder()
            .setName("Bot Open Games")
            .setType(ChannelType.GuildCategory);
        
        return builder.build();
    }

    static ongoingCategoryOptions()
    {
        const builder = new ChannelCreateOptionsBuilder()
            .setName("Bot Ongoing Games")
            .setType(ChannelType.GuildCategory);
        
        return builder.build();
    }

    static gameMasterRoleOptions()
    {
        const builder = new RoleCreateOptionsBuilder()
            .setName("Game Master")
            .setIsMentionable(true);
        
        return builder.build();
    }

    static trustedRoleOptions()
    {
        const builder = new RoleCreateOptionsBuilder()
            .setName("Trusted")
            .setIsMentionable(false);
        
        return builder.build();
    }

    static blitzerRoleOptions()
    {
        const builder = new RoleCreateOptionsBuilder()
            .setName("Blitzer")
            .setIsMentionable(true);
        
        return builder.build();
    }

    static playerRoleOptions(roleName)
    {
        const builder = new RoleCreateOptionsBuilder()
            .setName(roleName)
            .setIsMentionable(true);
        
        return builder.build();
    }
}
module.exports = GuildSetup;