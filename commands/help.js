const Discord = require("discord.js");

module.exports = {
  name: "help",
  desc: `This gives you an overview of all currently available commands.\nType '!help [command name]' to see what the specific command does.`,
  public: true,
  execute(message, args) {
    let commands = message.client.commands.filter(
      (command) => command.public === true
    );
    if (args.length >= 1) {
      args.forEach((arg) => {
        let helpCommands = commands.find(
          (command) => command.name === `${arg}`
        );
        let info = helpCommands.desc;
        message.channel.send(info);
      });
    } else {
      commands = commands.array();
      const commandsEmbed = [];
      commands.forEach((c) => {
        const command = {};
        command.name = `!${c.name}`;
        command.value = c.desc;
        commandsEmbed.push(command);
      });
      const embed = new Discord.MessageEmbed()
        .setTitle("Here are all currently available commands:")
        .addFields(commandsEmbed);
      message.channel.send(embed);
    }
  },
};
