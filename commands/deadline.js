const fetch = require("node-fetch");

module.exports = {
  name: "deadline",
  desc:
    "!deadline shows you the current amount of days left until the deadlines of each active card.",
  puplic: true,
  execute(message, args, date) {
    if (args[0] === "") {
      message.client.commands.get("deadlines").execute(message, date);
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
            args.forEach((word) => {
              if (cardName.includes(word)) {
                fetch(
                  `https://api.trello.com/1/boards/${process.env.BOARD}/cards/${e.id}?key=${process.env.KEY}&token=${process.env.TOKEN}`
                )
                  .then((response) => response.json())
                  .then((card) => {
                    const dateNow = new Date(date);
                    const dateDue = new Date(card.due);
                    const deadline = {};
                    deadline.name = card.name;
                    if (!card.due) {
                      deadline.value = `"${card.name}" hat momentan keine Deadline.`;
                    } else if (dateDue.getTime() > dateNow.getTime()) {
                      const timeDiff = Math.abs(
                        dateDue.getTime() - dateNow.getTime()
                      );
                      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                      if (diffDays <= 1) {
                        deadline.value = `"${card.name}" läuft in ${diffDays} Tag ab.`;
                      } else {
                        deadline.value = `"${card.name}" läuft in ${diffDays} Tagen ab.`;
                      }
                    } else if (dateDue.getTime() < dateNow.getTime()) {
                      const timeDiff = Math.abs(
                        dateDue.getTime() - dateNow.getTime()
                      );
                      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                      if (diffDays <= 1) {
                        deadline.value = `"${card.name}" ist seit ${diffDays} Tag abgelaufen.`;
                      } else {
                        deadline.value = `"${card.name}" ist seit ${diffDays} Tagen abgelaufen.`;
                      }
                    }
                    message.channel.send(deadline.value);
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              }
            });
          });
        });
    }
  },
};
