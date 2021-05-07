const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: "deadlines",
  desc:
    "This shows you the current amount of days left until the deadlines of each active card.",
  puplic: true,
  execute(message, date) {
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
          const dateNow = new Date(date);
          const dateDue = new Date(e.due);
          if (dateDue.getTime() > dateNow.getTime()) {
            const timeDiff = Math.abs(dateDue.getTime() - dateNow.getTime());
            const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            const card = {};
            card.name = e.name;
            if (diffDays <= 1) {
              card.value = `Noch ${diffDays} Tag bis ["${e.name}"](${e.url}) abläuft.`;
            } else {
              card.value = `Noch ${diffDays} Tage bis ["${e.name}"](${e.url}) abläuft.`;
            }
            cardsEmbed.push(card);
          }
        });
        cardsEmbed.sort((a, b) => {
          let va = a.value.match(/(\d+)/),
            vb = b.value.match(/(\d+)/);
          if (Number(va[0]) < Number(vb[0])) {
            return -1;
          }
          if (Number(va[0]) > Number(vb[0])) {
            return 1;
          }
          return 0;
        });
        const embed = new Discord.MessageEmbed()
          .setTitle("Zeit bis zur Deadline:")
          .addFields(cardsEmbed);
        message.channel.send(embed);
      })
      .catch((err) => console.error(err));
  },
};
