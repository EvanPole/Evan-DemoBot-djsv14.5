const { Discord, Client, IntentsBitField, EmbedBuilder, Events} = require('discord.js');
const path = require('path');
const fs = require('fs');

const intents = new IntentsBitField(131071);

const client = new Client({
    intents: intents,
    fetchAllMembers: true,
    retryLimit: Infinity,
    partials: ['MESSAGE', 'REACTION']
});

const config = require('./config.json')
client.login(config.token)

client.commands = new Discord.Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});





// client.on("ready", () => {
//     const Guilds = client.guilds.cache.map(guild => guild.name);
//     console.log(Guilds);
//     const help = new EmbedBuilder()
//         .setTitle("Evan Pole bot demo restarting")
//         .addFields(
//             { name: "Serveur", value: "```" + Guilds + "``` " + `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} Membres`, inline: false }
//         )
//         .setColor('#FF8C00')
//     client.users.cache.get('Client id ').send({ embeds: [help] });
// });
