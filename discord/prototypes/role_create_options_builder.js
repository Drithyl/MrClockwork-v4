class RoleCreateOptionsBuilder
{
    constructor()
    {
        this.name;
        this.isMentionable;
        this.permissions;
    }

    setName(name)
    {
        this.name = name;
        return this;
    }

    setIsMentionable(isMentionable)
    {
        this.isMentionable = isMentionable;
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

        if (this.isMentionable != null)
            options.mentionable = this.isMentionable;

        if (this.permissions != null)
            options.permissions = this.permissions;

        return options;
    }
}

module.exports = RoleCreateOptionsBuilder;