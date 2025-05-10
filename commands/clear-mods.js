// Command to clear the mod list in the docker-compose.yml file

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { exec } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear-mods')
        .setDescription('Clear all active mods in the configuration and restart the server'),
    
    async execute(interaction) {
        // Path to the docker-compose.yml file
        const filePath = '/home/squadserver/docker-compose.yml';
        
        // Read the current docker-compose.yml
        const yaml = fs.readFileSync(filePath, 'utf8');
        
        // Replace the MODS array with an empty one
        const updatedYaml = yaml.replace(/- MODS=\([^\)]*\)/, '- MODS=()');
        
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
        
        // Reply to the user confirming the mod list has been cleared and the server restarted
        await interaction.reply('All mods have been cleared. The server is restarting...');
    },
};
