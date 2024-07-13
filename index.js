const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Replace 'YOUR_BOT_TOKEN' with your bot's token
const token = 'MTI2MTY2NzA3NjgxMzIyNTk4NA.Ga3iKR.PhYMMMgyHtW-QbV06X7XSLWoRQRvkTFsoIooEU';

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    if (message.content === '!ping') {
        message.channel.send('Pong!');
    }
});

client.login(token);
