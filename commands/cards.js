const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: "cards",
  desc: "This gets all the cards on your board.",
  public: false,
  execute(message, args) {
    fetch(
      `https://api.trello.com/1/boards/${process.env.BOARD}/cards?key=${process.env.KEY}&token=${process.env.TOKEN}`
    )
      .then((response) => {
        console.log(`Response: ${response.status} ${response.statusText}`);
        return response.json();
      })
      .then((data) => {
        const cardsEmbed = [];
        data.forEach((e) => {
            if (e.name === '____________________________'){
              return
            }
            const card = {};
            card.name = e.name;
            card.value = `[Link](${e.url})`;
            card.inline = true;
            cardsEmbed.push(card);
        });
        cardsEmbed.sort((a, b) => {
          return ('' + a.name).localeCompare(b.name);
        });    
        for (let i = 0; i < cardsEmbed.length; i+=25){
          let cardsEmbedSliced = cardsEmbed.slice(i);
          const embed = new Discord.MessageEmbed()
          .setTitle("Momentane Karten")
          .addFields(cardsEmbedSliced);
        message.channel.send(embed);
        }
      })
      .catch((err) => console.error(err));
  },
};
