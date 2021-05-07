const fs = require("fs");

module.exports = {
  name: "unsub",
  desc:
    "!unsub unsubscribes you from my awesome notification service, so you will probably come back after you missed the next deadline.",
  public: true,
  execute(message, args, client) {
    const id = message.author.id;
    message.guild.members
      .fetch(id)
      .then((value) => {
        if (!client.subscriber.find((user) => user.id === id)) {
          return message.reply("you are currently not subscribed.");
        }
        const alerts = client.alerts.filter((alert) => alert.userId === id);
        if (client.alerts.has(alerts.firstKey())) {
          let keys = alerts.firstKey(alerts.size);
          for (const key of keys) {
            client.alerts.delete(key);
          }
        }
        const subscribed = value;
        client.subscriber.delete(subscribed.user.username, subscribed.user);
        const clone = JSON.stringify(client.subscriber.clone());
        const clone2 = JSON.stringify(client.alerts.clone());
        fs.writeFileSync("./database/subscriber.js", clone, (err) =>
          console.error(err)
        );
        fs.writeFileSync("./database/alerts.js", clone2, (err) =>
          console.error(err)
        );
        message.reply("you have unsubscribed from the deadline notifications.");
      })
      .catch((err) => console.error(err));
  },
};
