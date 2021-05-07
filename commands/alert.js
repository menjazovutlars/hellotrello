const fetch = require("node-fetch");
const fs = require("fs");

module.exports = {
  name: "alert",
  desc: "My awesome notification service, bot-use only!",
  public: false,
  execute(client, date) {
    fetch(
      `https://api.trello.com/1/boards/${process.env.BOARD}/cards?key=${process.env.KEY}&token=${process.env.TOKEN}`
    )
      .then((response) => {
        console.log(`Response: ${response.status} ${response.statusText}`);
        return response.json();
      })
      .then((data) => {
        data.forEach((e) => {
          const dateNow = new Date(date);
          const dateDue = new Date(e.due);
          if (dateDue.getTime() > dateNow.getTime()) {
            const timeDiff = Math.abs(dateDue.getTime() - dateNow.getTime());
            const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            const card = {};
            card.id = e.id;
            card.url = e.shortUrl;
            card.name = e.name;
            card.value = `"${e.name}" läuft in ${diffDays} Tagen ab.`;

            if (diffDays <= 10) {
              client.subscriber.each((user) => {
                let message = `Hey ${user.username}, ich möchte dich daran erinnern, dass "${card.name}" in weniger als ${diffDays} Tagen fällig ist. Die Karte findest du hier: ${card.url}`;
                if (client.alerts.has(user.id + card.id)) {
                  let userAlert = client.alerts.get(user.id + card.id);
                  const timeSinceLastAlert = Math.abs(
                    userAlert.lastAlert.getTime() - dateNow.getTime()
                  );
                  const daysSinceLastAlert = Math.ceil(
                    timeSinceLastAlert / (1000 * 3600 * 24)
                  );
                  if (
                    daysSinceLastAlert >= 3 &&
                    (diffDays <= 7 || diffDays <= 4)
                  ) {
                    const set = {
                      username: user.username,
                      userId: user.id,
                      cardname: card.name,
                      cardId: card.id,
                      days: diffDays,
                      lastAlert: dateNow,
                    };
                    user.send(message);
                    client.alerts.set(user.id + card.id, set);
                    const clone = JSON.stringify(client.alerts.clone());
                    fs.writeFileSync("./database/alerts.js", clone, (err) =>
                      console.error(err)
                    );
                  } else if ( diffDays === 1) {
                    if (daysSinceLastAlert === 1){
                      return;
                    }
                    message = `Hey ${user.username}, ich möchte dich daran erinnern, dass "${card.name}" in weniger als ${diffDays} Tag fällig ist. Die Karte findest du hier: ${card.url}`;
                    const set = {
                      username: user.username,
                      userId: user.id,
                      cardname: card.name,
                      cardId: card.id,
                      days: diffDays,
                      lastAlert: dateNow,
                    };
                    user.send(message);
                    client.alerts.set(user.id + card.id, set);
                    const clone = JSON.stringify(client.alerts.clone());
                    fs.writeFileSync("./database/alerts.js", clone, (err) =>
                      console.error(err)
                    );
                  } else if (diffDays < 1) {
                    client.alerts.delete(user.id + card.id);
                    const clone = JSON.stringify(client.alerts.clone());
                    fs.writeFileSync("./database/alerts.js", clone, (err) =>
                      console.error(err)
                    );
                  }
                } else {
                  const set = {
                    username: user.username,
                    userId: user.id,
                    cardname: card.name,
                    cardId: card.id,
                    days: diffDays,
                    lastAlert: dateNow,
                  };
                  user.send(message);
                  client.alerts.set(user.id + card.id, set);
                  const clone = JSON.stringify(client.alerts.clone());
                  fs.writeFileSync("./database/alerts.js", clone, (err) =>
                    console.error(err)
                  );
                }
              });
            }
          }
        });
      })
      .catch((err) => console.error(err));
  },
};
