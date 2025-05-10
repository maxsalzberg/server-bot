/*
This script pushes all commands in the commands folder to be usable in discord.
*/

require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
const clientID = process.env.DISCORD_CLIENT_ID;
const guildID = process.env.DISCORD_GUILD_ID;

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];

// Resolve the absolute path to the commands folder
const commandsPath = path.join(__dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log('Loading command files:', commandFiles);

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands...');

        let data;
        if (guildID) {
            data = await rest.put(
                Routes.applicationGuildCommands(clientID, guildID),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} guild command(s).`);
        } else {
            data = await rest.put(
                Routes.applicationCommands(clientID),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} global command(s).`);
        }

    } catch (error) {
        console.error('Error during command deployment:', error);
    }
})();
