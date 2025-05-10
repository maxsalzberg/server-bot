// Command to update the mod list in the docker-compose.yml file and restart the Docker container

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { exec } = require('child_process');

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
        // Get the list of mod IDs from the user input
        const mods = interaction.options.getString('mods');
        
        // Path to the docker-compose.yml file
        const filePath = '/home/squadserver/docker-compose.yml';
        
        // Read the current docker-compose.yml
        const yaml = fs.readFileSync(filePath, 'utf8');
        
        // Update the MODS environment variable in the docker-compose.yml file
        const updatedYaml = yaml.replace(/- MODS=\(\)/, `- MODS=(${mods})`);
        
        // Write the updated content back to the file
        fs.writeFileSync(filePath, updatedYaml, 'utf8');
        
        // Restart the Docker container to apply the changes
        exec('docker compose -f /home/squadserver/docker-compose.yml restart', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });
        
        // Reply to the user confirming the mod list update and server restart
        await interaction.reply(`Mod list updated: ${mods}. The server is restarting...`);
    },
};
