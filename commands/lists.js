const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: "lists",
  desc: "This gives you an overview of all lists on your board.",
  public: false,
  execute(message, args) {
    fetch(
      `https://api.trello.com/1/batch?key=${process.env.KEY}&token=${process.env.TOKEN}&urls=/boards/${process.env.BOARD}/,/boards/${process.env.BOARD}/lists/`
    )
      .then((response) => {
        console.log(`Response: ${response.status} ${response.statusText}`);
        return response.json();
      })
      .then((data) => {
        const board = data[0]["200"];
        const lists = data[1]["200"];
        const listsEmbed = [];
        lists.forEach((e) => {
            if (e.name === '____________________________'){
              return
            }
            const list = {};
            list.name = e.name;
            list.value = `[Link](${board.url})`;
            list.inline = true;
            listsEmbed.push(list);
        });
        listsEmbed.sort((a, b) => {
          return ('' + a.name).localeCompare(b.name);
        });    
        for (let i = 0; i < listsEmbed.length; i+=25){
          let listsEmbedSliced = listsEmbed.slice(i);
          const embed = new Discord.MessageEmbed()
          .setTitle("Momentane Listen")
          .addFields(listsEmbedSliced);
        message.channel.send(embed);
        }
      })
      .catch((err) => console.error(err));
  },
};
