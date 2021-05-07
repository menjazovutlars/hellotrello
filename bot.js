const Discord = require("discord.js");
const fs = require("fs");
const schedule = require("node-schedule");
const client = new Discord.Client();
const fetch = require('node-fetch');
require('dotenv').config();

client.commands = new Discord.Collection();
client.subscriber = new Discord.Collection();
client.alerts = new Discord.Collection();

let subArray = [];
let alArray = [];

client.databaseSubscriber = fs.createReadStream(
  "./database/subscriber.js",
  (err) => console.error(err)
);
client.databaseAlerts = fs.createReadStream("./database/alerts.js", (err) =>
  console.error(err)
);
client.databaseSubscriber.on("data", (chunk) => {
  subArray = JSON.parse(chunk.toString());
});
client.databaseAlerts.on("data", (chunk) => {
  alArray = JSON.parse(chunk.toString());
});

const commandFiles = fs
  .readdirSync("./commands/")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const prefix = "-";
client.once("ready", () => {
  console.log("HelloTrello is online!");
  for (let entry of subArray) {
    entry = new Discord.User(client,entry);
    client.subscriber.set(entry.username, entry);
  }
  for (const entry of alArray) {
    entry.lastAlert = new Date(entry.lastAlert);
    client.alerts.set(entry.userId + entry.cardId, entry);
  }
});
let now = new Date();

const aj1 = schedule.scheduleJob("0 8 * * *", () => {
  now = new Date();
  client.commands.get("alert").execute(client, now);
});
const aj2 = schedule.scheduleJob("0 12 * * *", () => {
  now = new Date();
  client.commands.get("alert").execute(client, now);
});
const aj3 = schedule.scheduleJob("0 16 * * *", () => {
  now = new Date();
  client.commands.get("alert").execute(client, now);
});
const aj4 = schedule.scheduleJob(" 0 20 * * *", () => {
  now = new Date();
  client.commands.get("alert").execute(client, now);
});



client.on("message", (message) => {
  if (
    !message.content.startsWith(prefix) ||
    message.author.bot ||
    message.channel.type === "dm"
  )
    return;
  const args = message.content.slice(prefix.length).trim().split(" ");
  const command = args.shift().toLowerCase();
  const argsCombinded = args.join(" ").toLowerCase();
  const allArgs = [];
  allArgs.push(argsCombinded);
  if (command === "ping") {
    client.commands.get("ping").execute(message, args);
  }
  if (command === "name") {
    client.commands.get("name").execute(message, args);
  }
  if (command === "board") {
    client.commands.get("board").execute(message, args, client);
  }
  if (command === "card") {
    client.commands.get("card").execute(message, allArgs);
  }
  if (command === "list") {
    client.commands.get("list").execute(message, allArgs);
  }
  if (command === "sub") {
    client.commands.get("sub").execute(message, args, client);
  }
  if (command === "unsub") {
    client.commands.get("unsub").execute(message, args, client);
  }
  if (command === "subscriber") {
    console.log(client.subscriber);
  }
  if (command === "deadline") {
    client.commands.get("deadline").execute(message, allArgs, now);
  }
  if (command === "help") {
    client.commands.get("help").execute(message, args);
  }
});


client.login(`${process.env.DISC_TOKEN}`);
