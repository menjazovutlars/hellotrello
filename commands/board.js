const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: "board",
  desc: "!board gives you an overview of your board.",
  public: true,
  execute(message, args) {
    
    fetch(
      `https://api.trello.com/1/batch?key=${process.env.KEY}&token=${process.env.TOKEN}&urls=/boards/${process.env.BOARD}/,/boards/${process.env.BOARD}/cards,/boards/${process.env.BOARD}/members,/boards/${process.env.BOARD}/lists`
    )
      .then((response) => {
        console.log(`Response: ${response.status} ${response.statusText}`);
        return response.json();
      })
      .then((data) => {
       const board =data[0]["200"];
        const cards =data[1]["200"].length;
        const members = data[2]["200"].length;
        const lists = data[3]["200"].length;
        const embed = new Discord.MessageEmbed()
          .setTitle(`${board.name}`)
          .setURL(board.url)
          .setDescription(`${board.desc}`).addField('Member', `${members}`, true).addField('Listen',`${lists}`,true).addField(`Karten`,`${cards}`, true);
        message.channel.send(embed);
      })
      .catch((err) => console.error(err));
    
    
    // fetch(`https://api.trello.com/1/search?key=${process.env.KEY}&token=${process.env.TOKEN}&query=modelTypes:[boards]`, {
    //   method: 'GET',
    //   headers: {
    //     'Accept': 'application/json'
    //   }
    // })
    //   .then(response => {
    //     console.log(
    //       `Response: ${response.status} ${response.statusText}`
    //     );
    //     return response.json();
    //   })
    //   .then(data => console.log(data))
    //   .catch(err => console.error(err));
  },
};
