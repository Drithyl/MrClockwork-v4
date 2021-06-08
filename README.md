# MrClockwork-v4
Discord Bot built to host Dominions 5 games on demand through a few chat commands (or now with a web interface at https://www.mrclockwork.net/).

Changes from the last v3 include a completely refactored, rewritten code from scratch for ease of maintenace and robustness, a web interface for some of the previous
command menus (host game, change settings, set player preferences), game-specific player preferences, bot-enforced game timers, improved game status feedback
(game channels now have a pinned post which gets updated by the bot with the last known timer, turn, status, undone turns, etc. every few seconds), and more.

This release is intended to be the final version of the bot, and will be properly maintained and kept up to date, to make it easier for others to look into
the code and collaborate if they so desire. New features and commands will be added over time as necessary. This means that repositories for the previous Mr. Clockwork
versions will now become obsolete.

This is only one of two parts of the codebase. This part specifically handles the Discord integration and acts as the master in the hierarchy, keeping track of
all required data (games hosted, player preferences, guilds, etc) and updating the status of the games. The so-called Hosting Slave, found at 
https://github.com/Drithyl/Hosting-slave-v4, runs on every dedicated server that is intended to host the games, and takes care of interacting directly with
Dominions, launch the processes with the correct flags, dealing with the game's savefiles and backups, installing mods and maps that users upload, etc.
