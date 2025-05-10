const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { Docker } = require('node-docker-api'); // Docker API for interacting with Docker via socket

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
        
        // Create a Docker client to interact with Docker via the socket
        const docker = new Docker({ socketPath: '/var/run/docker.sock' });

        try {
            // Reply to the user confirming that the mod list is cleared
            await interaction.reply('All mods have been cleared. The server is restarting...');
            
            // Get the list of containers, filtered by the fixed container name
            const containers = await docker.container.list({ all: true, filters: { name: ['north-server'] } });

            // If the container doesn't exist, send a follow-up error message
            if (containers.length === 0) {
                await interaction.followUp('Container "north-server" does not exist.');
                throw new Error('Container "north-server" does not exist.');
            }

            // Restart the container
            await containers[0].restart();

            // Confirm that the container was successfully restarted
            await interaction.followUp('The server has been successfully restarted.');
        } catch (error) {
            // Handle error and inform the user
            console.error(error);
            await interaction.followUp(`An error occurred while trying to restart the container: ${error.message}`);
        }
    },
};
