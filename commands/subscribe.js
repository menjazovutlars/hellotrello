const fs = require("fs");

module.exports = {
  name: "sub",
  desc:
    "!sub lets you subscribe to my awesome notification service, so you will never miss a deadline ever again.",
  public: true,
  execute(message, args, client) {
    const id = message.author.id;
    message.guild.members
      .fetch(id)
      .then((value) => {
        if (client.subscriber.find((user) => user.id === id)) {
          return message.reply("you are already subscribed.");
        }
        const subscribed = value;
        client.subscriber.set(subscribed.user.username, subscribed.user);
        const clone = JSON.stringify(client.subscriber.clone());
        fs.writeFileSync("./database/subscriber.js", clone, (err) =>
          console.error(err)
        );
        message.reply("you have subscribed to the deadline notifications.");
      })
      .catch((err) => console.error(err));
  },
};
