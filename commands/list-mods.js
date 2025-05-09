// Command to list all the currently active mods from the docker-compose.yml file

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-mods')
        .setDescription('List all active mods in the configuration'),
    
    async execute(interaction) {
        // Path to the docker-compose.yml file
        const filePath = '/home/squadserver/docker-compose.yml';
        
        // Read the current docker-compose.yml
        const yaml = fs.readFileSync(filePath, 'utf8');
        
        // Extract the mods list using regex
        const modsMatch = yaml.match(/- MODS=\(([^)]+)\)/);
        
        if (modsMatch && modsMatch[1]) {
            const modsList = modsMatch[1].split(' ').join(', ');
            await interaction.reply(`Current active mods: ${modsList}`);
        } else {
            await interaction.reply('No mods are currently active.');
        }
    },
};
