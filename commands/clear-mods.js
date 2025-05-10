const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const restartCommand = require('./restart'); // Импортируем команду перезапуска

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear-mods')
        .setDescription('Clear all active mods in the configuration and restart the server'),
    
    async execute(interaction) {
        // Path to the docker-compose.yml file
        const filePath = '/home/squadserver/docker-compose.yml';
        
        // Read the current docker-compose.yml content
        const yaml = fs.readFileSync(filePath, 'utf8');
        
        // Replace the MODS array with an empty one
        const updatedYaml = yaml.replace(/- MODS=\([^\)]*\)/, '- MODS=()');
        
        // Write the updated content back to the file
        fs.writeFileSync(filePath, updatedYaml, 'utf8');
        
        try {
            // Reply to the user confirming that the mod list is cleared
            await interaction.reply('All mods have been cleared. The server is restarting...');

            // Call the restart container command (using the imported execute function)
            await restartCommand.execute(interaction);
        } catch (error) {
            // Handle error and inform the user
            console.error(error);
            await interaction.followUp(`An error occurred while clearing mods: ${error.message}`);
        }
    },
};
