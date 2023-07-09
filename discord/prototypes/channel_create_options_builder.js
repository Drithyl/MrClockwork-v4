class ChannelCreateOptionsBuilder
{
    constructor()
    {
        this.name;
        this.type;
        this.parent;
        this.permissions;
    }

    setName(name)
    {
        this.name = name;
        return this;
    }

    setType(type)
    {
        this.type = type;
        return this;
    }

    setParent(parent)
    {
        this.parent = parent;
        return this;
    }

    setPermissions(permissions)
    {
        this.permissions = permissions;
        return this;
    }

    build()
    {
        const options = {};

        if (this.name != null)
            options.name = this.name;

        if (this.type != null)
            options.type = this.type;

        if (this.parent != null)
            options.parent = this.parent;

        if (this.permissions != null)
            options.permissionOverwrites = this.permissions;

        return options;
    }
}

module.exports = ChannelCreateOptionsBuilder;