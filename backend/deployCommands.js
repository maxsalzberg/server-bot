/*
This script pushes all commands in the commands folder to be usable in Discord.
*/

require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
const clientID = process.env.DISCORD_CLIENT_ID;
const guildID = process.env.DISCORD_GUILD_ID;
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');

const commands = [];

// Get all commands from the commands folder

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
console.log(commandFiles);

for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands.push(command.data.toJSON());
}

// Add custom mod-related commands
const modCommands = [
    {
        data: {
            name: 'update-mods',
            description: 'Update mod list in the configuration and restart the server',
            options: [
                {
                    type: 3, // String
                    name: 'mods',
                    description: 'List of mods separated by spaces (e.g., 13371337 12341234)',
                    required: true,
                }
            ]
        },
        execute: async (interaction) => {
            const mods = interaction.options.getString('mods');
            // Update MODS in docker-compose.yml
            const filePath = '/home/squadserver/docker-compose.yml';
            const fs = require('fs');
            const yaml = fs.readFileSync(filePath, 'utf8');
            const updatedYaml = yaml.replace(/MODS=\(\)/, `MODS=(${mods})`);
            fs.writeFileSync(filePath, updatedYaml);
            
            // Restart the Docker container
            const { exec } = require('child_process');
            exec(`docker compose -f ${filePath} up -d`, (err, stdout, stderr) => {
                if (err) {
                    interaction.reply("Error during restart: " + stderr);
                    return;
                }
                interaction.reply("Mods updated and server restarted.");
            });
        }
    },
    {
        data: {
            name: 'list-mods',
            description: 'Show the current list of mods',
        },
        execute: async (interaction) => {
            const filePath = '/home/squadserver/docker-compose.yml';
            const fs = require('fs');
            const yaml = fs.readFileSync(filePath, 'utf8');
            const modsMatch = yaml.match(/MODS=\((.*?)\)/);
            const mods = modsMatch ? modsMatch[1].split(' ') : [];
            interaction.reply(`Current mod list: ${mods.join(', ') || 'No mods'}`);
        }
    },
    {
        data: {
            name: 'clear-mods',
            description: 'Clear the list of mods',
        },
        execute: async (interaction) => {
            const filePath = '/home/squadserver/docker-compose.yml';
            const fs = require('fs');
            const yaml = fs.readFileSync(filePath, 'utf8');
            const updatedYaml = yaml.replace(/MODS=\(.*?\)/, 'MODS=()');
            fs.writeFileSync(filePath, updatedYaml);
            
            // Restart the Docker container
            const { exec } = require('child_process');
            exec(`docker compose -f ${filePath} up -d`, (err, stdout, stderr) => {
                if (err) {
                    interaction.reply("Error during restart: " + stderr);
                    return;
                }
                interaction.reply("Mod list cleared and server restarted.");
            });
        }
    }
];

// Combine custom mod commands with existing ones
commands.push(...modCommands);

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        // Publish to guild if guildID is set, otherwise publish globally
        if (guildID) {
            const data = await rest.put(
                Routes.applicationGuildCommands(clientID, guildID),
                { body: commands },
            );
            console.log('Successfully reloaded ' + data.length + ' commands.');
        } else {
            const data = await rest.put(
                Routes.applicationCommands(clientID),
                { body: commands },
            );
            console.log('Successfully reloaded ' + data.length + ' commands.');
        }

    } catch (error) {
        console.error(error);
    }
})();
