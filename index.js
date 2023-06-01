const usertype_lookup = {
    "": "user",
    "admin": "TWITCH ADMIN",
    "global_mod": "TWITCH MOD",
    "staff": "TWITCH STAFF"
};


const tmi = require("tmi.js");
const fs = require("fs");
const readline = require("readline")
// import chalk from 'chalk'; // Requires ESM module type

function readConfig(){
    const raw = fs.readFileSync("config.json",{encoding:"utf-8"});
    return JSON.parse(raw);
}
const config = readConfig();

const client = new tmi.client(config["twitch-config"]);

client.on("chat",onChatMessage);
client.on("connected",onConnected);

const log_file = "chat.log";

let console_interface = readline.createInterface(process.stdin,process.stdout);
console_interface.on("line",sendMessage);
client.connect().catch(console.error);

function onConnected(address, port){
    console.info(`Connected to Twitch on ${address}:${port}`);
}

function onChatMessage(channel, userstate, message, self){
    let author_status = Object.keys(userstate.badges).join();
    let message_report = `[CHAT${channel}]: (${author_status})${userstate["display-name"]}: ${message}`;
    if (!config.quiet){
        // console.log(chalk.bgBlue(message_report));
        console.log(message_report);
    }
    fs.writeFile(log_file,message_report+"\n",{flag:"a"},err => {
        if (err !== null) console.error(`Error writing to file! ${err}`);
    });
}

function sendMessage(message){
    client.say(config["twitch-config"].channels[0],message);
}