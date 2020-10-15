
module.exports = UserWrapper;

function UserWrapper(discordJsUserObject)
{
  const _discordJsUserObject = discordJsUserObject;

  this.getId = () => _discordJsUserObject.id;
  this.getUsername = () => _discordJsUserObject.username;
}
