const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const restartCommand = require('./restart'); // Импортируем команду перезапуска

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

        try {
            // Reply to the user confirming the mod list update
            await interaction.reply(`Mod list updated: ${mods}. The server is restarting...`);

            // Call the restart container command (using the imported execute function)
            await restartCommand.execute(interaction);
        } catch (error) {
            // Handle error and inform the user
            console.error(error);
            await interaction.followUp(`An error occurred while updating mods: ${error.message}`);
        }
    },
};
