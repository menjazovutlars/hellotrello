const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: "card",
  desc: `!card gets you all the cards on your board.\nType '!card [keyword]' to get all the cards with your keyword.`,
  public: true,
  execute(message, args) {
    if (args[0] === "") {
      message.client.commands.get("cards").execute(message, args);
    } else {
      fetch(
        `https://api.trello.com/1/boards/${process.env.BOARD}/cards?key=${process.env.KEY}&token=${process.env.TOKEN}`
      )
        .then((response) => {
          console.log(`Response: ${response.status} ${response.statusText}`);
          return response.json();
        })
        .then((data) => {
          data.forEach((e) => {
            const cardName = JSON.stringify(e.name).toLowerCase();
            const card = {};
            card.id = e.id;
            args.forEach((word) => {
              if (cardName.includes(word)) {
                fetch(
                  `https://api.trello.com/1/batch?key=${process.env.KEY}&token=${process.env.TOKEN}&urls=/cards/${e.id},/cards/${e.id}/list`
                )
                  .then((response) => response.json())
                  .then((data) => {
                    const dataCard = data[0]["200"];
                    const dataList = data[1]["200"];
                    const labels = [];
                    for (index in dataCard.labels) {
                      let label = dataCard.labels[index].name;
                      labels.push(label);
                    }
                    const date = new Date(dataCard.due);
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
                    console.log(dataCard.cover.idAttachment);
                    const embed = new Discord.MessageEmbed()
                      .setTitle(`${dataList.name}\n${dataCard.name}`)
                      .setURL(dataCard.url);
                    if(dataCard.cover.idAttachment != null) {
                      console.log(dataCard.cover.scaled[3].url);
                      embed.setImage(dataCard.cover.scaled[6].url);
                    }
                    if (dataCard.due) {
                      embed.addField(`Deadline:`, deadline);
                    }
                    if (labels.length > 0) {
                      embed.addField(`Labels:`, labels);
                    }
                    if (dataCard.desc) {
                      if(dataCard.desc.length <= 1024) embed.addField(`Beschreibung:`, dataCard.desc) 
                      else embed.addField(`Beschreibung:`, `Die gesamte Beschreibung findest du [hier.](${dataCard.url})`);
                    }
                    if (dataCard.cover.sharedSourceUrl) {
                      embed.setThumbnail(dataCard.cover.sharedSourceUrl);
                    }
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
