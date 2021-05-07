module.exports = {
  name: "ping",
  desc: "!ping is a ping command, funny.",
  public: true,
  execute(message, args) {
    message.channel.send("pinged");
  },
};
