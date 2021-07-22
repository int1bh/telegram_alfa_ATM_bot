const { Telegraf, Markup } = require("telegraf");
const fs = require('fs')
const path = require('path')
const certFile = path.resolve(__dirname, 'cert/apidevelopers.cer')
const keyFile = path.resolve(__dirname, 'cert/apidevelopers.key')
const request = require("request");
const X_IBM_Client_Id = "93f0bffa-8c93-4694-a9ff-7383967088b5";

const optionsAtmsStatus = {
  method: "GET",
  url: "https://apiws.alfabank.ru/alfabank/alfadevportal/atm-service/atms/status",
  cert: fs.readFileSync(certFile),
  key: fs.readFileSync(keyFile),
  passphrase: '',
  headers: {
   "x-ibm-client-id": X_IBM_Client_Id,
    accept: "application/json"
  },
};

const optionsAtms = {
    method: "GET",
    url: "https://apiws.alfabank.ru/alfabank/alfadevportal/atm-service/atms",
    cert: fs.readFileSync(certFile),
    key: fs.readFileSync(keyFile),
    passphrase: '',
    headers: {
     "x-ibm-client-id": X_IBM_Client_Id,
      accept: "application/json"
    },
  };

function getData(data) {
   return new Promise((resolve, reject) => {
    request(data, async function (error, response, body) {
        if (error) {
            return reject(error)
        } 
        return resolve(JSON.parse(body))
      });
   })
}


const botToken = "1930692856:AAGjghMGHBnryqcb8Y8iQx-rax-WoS9Ojlg";
const bot = new Telegraf(botToken);

function getMenu() {
  return Markup.keyboard([
    ["В начало ⤴️", "Положить", "Снять"],
  ]).resize();
}

bot.start((ctx) => {
  ctx.replyWithHTML(
    `Привет, <b>${ctx.chat.first_name}</b>. Я помогу найти тебе банкомат! Отправь свою геопозицию`, 
    getMenu()
  );
  console.log(ctx.message);
});

bot.hears("В начало ⤴️", ctx => ctx.replyWithHTML(
    `Привет, <b>${ctx.chat.first_name}</b>. Я помогу найти тебе банкомат! Отправь свою геолокацию`, 
    getMenu()
  ))


bot.hears("Положить", (ctx) => {
    const ATMS_STATUS = getData(optionsAtmsStatus)
    const ATMS = getData(optionsAtms)

    ATMS_STATUS.then(res => {
        const a = res.data.atms[0].deviceId
        const b = res.data.atms[0].availableNow.online
        ctx.replyWithHTML(`Банкомат ${a} доступен: ${b}`)
    })
    ATMS.then(res => {
        const address = res.data.atms[0].address.city
        const location = res.data.atms[0].address.location
        ctx.replyWithHTML(`город ${address} расположен: ${location}`)
    })
});

bot.on("location", (ctx) => {
  ctx.reply(
    `Широта: ${ctx.message.location.latitude} Долгота: ${ctx.message.location.longitude}`
    //`sdhks`
  );
});

bot.on('message', (ctx) => {
    ctx.reply(
      `ку-ку`
    );
    console.log(ctx.message);
  });

bot.launch();
