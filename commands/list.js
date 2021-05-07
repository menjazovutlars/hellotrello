const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: "list",
  desc: `!list gets you all the lists on your board.\nType '!list [keyword]' to get all the lists with your keyword.`,
  public: true,
  execute(message, args) {
    if (args[0] === "") {
      message.client.commands.get("lists").execute(message, args);
    } else {
      fetch(
        `https://api.trello.com/1/boards/${process.env.BOARD}/lists?key=${process.env.KEY}&token=${process.env.TOKEN}`
      )
        .then((response) => {
          console.log(`Response: ${response.status} ${response.statusText}`);
          return response.json();
        })
        .then((data) => {
          data.forEach((e) => {
            const listName = JSON.stringify(e.name).toLowerCase();
            const list = {};
            list.id = e.id;
            args.forEach((word) => {
              if (listName.includes(word)) {
                fetch(
                  `https://api.trello.com/1/batch?key=${process.env.KEY}&token=${process.env.TOKEN}&urls=/lists/${e.id},/lists/${e.id}/cards`
                )
                  .then((response) => response.json())
                  .then((data) => {
                    const dataList = data[0]["200"];
                    const dataCard = data[1]["200"];
                    const cardsEmbed = [];
                    dataCard.forEach((e) => {
                      const labels = [];
                      const card = {};
                      let cardValue = "";
                      for (index in e.labels) {
                        let label = ` ${e.labels[index].name}`;
                        labels.push(label);
                      }
                      const date = new Date(e.due);
                      const due = {};
                      due.year = date.getFullYear();
                      due.month = date.getMonth() + 1;
                      if (due.month < 10) {
                        due.month = "0" + due.month;
                      }
                      due.dt = date.getDate();
                      if (due.dt < 10) {
                        due.dt = "0" + due.dt;
                      }
                      due.hours = date.getHours();
                      if (due.hours < 10) {
                        due.hours = "0" + due.hours;
                      }
                      due.minutes = date.getMinutes();
                      if (due.minutes < 10) {
                        due.minutes = "0" + due.minutes;
                      }
                      due.time = `${due.hours}:${due.minutes} Uhr`;
                      const deadline = `${due.dt}.${due.month}.${due.year} um ${due.time}`;
                      const cardName = e.name;
                      if (!e.due) {
                        if (labels.length < 1) {
                          cardValue = `-\n[Link](${e.url})`;
                        }
                        if (labels.length > 0) {
                          cardValue = `Labels: ${labels}\n[Link](${e.url})`;
                        }
                      } else {
                        if (labels.length > 0) {
                          cardValue = `Labels: ${labels}\nDeadline: ${deadline}\n[Link](${e.url})`;
                        }
                        if (labels.length < 1) {
                          cardValue = `Deadline: ${deadline}\n[Link](${e.url})`;
                        }
                      }
                      card.name = cardName;
                      card.value = cardValue;
                      cardsEmbed.push(card);
                    });
                    const embed = new Discord.MessageEmbed()
                      .setTitle(`${dataList.name}`)
                      .addFields(cardsEmbed);
                    message.channel.send(embed);
                  })
                  .catch((err) => console.error(err));
              }
            });
          });
        })
        .catch((err) => console.error(err));
    }
  },
};
