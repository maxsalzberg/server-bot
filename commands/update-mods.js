const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { Docker } = require('node-docker-api'); // Using Docker API library to interact with Docker

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update-mods')
        .setDescription('Update the mod list in the configuration and restart the server')
        .addStringOption(option =>
            option.setName('mods')
                .setDescription('List of mod IDs separated by spaces (e.g., 13371337 12341234)')
                .setRequired(true)
        ),

    async execute(interaction) {
        // Get the list of mod IDs from user input
        const mods = interaction.options.getString('mods');

        // Path to the docker-compose.yml file
        const filePath = '/home/squadserver/docker-compose.yml';

        // Read the current docker-compose.yml content
        const yaml = fs.readFileSync(filePath, 'utf8');

        // Update the MODS environment variable in docker-compose.yml
        const updatedYaml = yaml.replace(/- MODS=\(\)/, `- MODS=(${mods})`);

        // Write the updated content back to the file
        fs.writeFileSync(filePath, updatedYaml, 'utf8');

        // Create a Docker client to interact with Docker via the socket
        const docker = new Docker({ socketPath: '/var/run/docker.sock' });

        try {
            // Reply to the user confirming the mod list update
            await interaction.reply(`Mod list updated: ${mods}. The server is restarting...`);

            // Get the list of containers, filtered by name
            const containers = await docker.container.list({ all: true, filters: { name: ['tonylife-bot'] } });

            // If the container doesn't exist, send a follow-up error message
            if (containers.length === 0) {
                await interaction.followUp('Container "tonylife-bot" does not exist.');
                throw new Error('Container "tonylife-bot" does not exist.');
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
