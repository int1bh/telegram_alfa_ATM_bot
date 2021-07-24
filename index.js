const { Telegraf, Markup } = require("telegraf");
const fs = require('fs')
const path = require('path')
const certFile = path.resolve(__dirname, 'cert/apidevelopers.cer')
const keyFile = path.resolve(__dirname, 'cert/apidevelopers.key')
const request = require("request");
const X_IBM_Client_Id = "93f0bffa-8c93-4694-a9ff-7383967088b5";

//                                  Получение данных от API банка
//================================================================================================

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

//=================================================================================================



//                                    Расчет местоположения
//=================================================================================================

function distanceBetweenTwoPlace(myLatitude, myLongitude, atmLatitude, atmLongitude) {

  // перевести координаты в радианы
  let myLatitudeToRadian = myLatitude * Math.PI / 180;
  let atmLatitudeToRadian = atmLatitude * Math.PI / 180;
  let myLongitudeToRadian = myLongitude * Math.PI / 180;
  let atmLongitudeToRadian = atmLongitude * Math.PI / 180;
  
  // косинусы и синусы широты и разницы долготы
  let cl1 = Math.cos(myLatitudeToRadian);
  let cl2 = Math.cos(atmLatitudeToRadian);
  let sl1 = Math.sin(myLatitudeToRadian);
  let sl2 = Math.sin(atmLatitudeToRadian);
  let delta = atmLongitudeToRadian - myLongitudeToRadian;
  let cdelta = Math.cos(delta);
  let sdelta = Math.sin(delta);
  
  // вычисления длины большого круга
  let y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));
  let x = sl1 * sl2 + cl1 * cl2 * cdelta;
  
  let ad = Math.atan2(y, x);
  let dist = (ad * 6371000) /1000;
    
  return +dist.toFixed(2);
  }
  
  function getNearestAtm(myLatitude, myLongitude, arr, amount) {
      let distToAtms = []
  
      for(i = 0; i < arr.length; i++) {
          distToAtms.push({
            dist: distanceBetweenTwoPlace(myLatitude, myLongitude, arr[i].coordinates.latitude, arr[i].coordinates.longitude),
            id: arr[i].deviceId, cashOut: arr[i].services.cardCashOut,
            cashIn: arr[i].services.cardCashIn,
            cardPayments: arr[i].services.cardPayments,
            payments: arr[i].services.payments,
            nfc: arr[i].nfc, city: arr[i].address.city,
            address: arr[i].address.location,
            addressComments: arr[i].addressComments,
            latitude: arr[i].coordinates.latitude,
            longitude: arr[i].coordinates.longitude
          })
      }
      
      return distToAtms.sort(function (a,b) {
          if (a.dist > b.dist) {
              return 1;
            }
            if (a.dist < b.dist) {
              return -1;
            }
            return 0;
          
      }).slice(0, amount)
  }

//===========================================================================================================


//                                               Функционал бота
//===========================================================================================================

const botToken = "1930692856:AAGjghMGHBnryqcb8Y8iQx-rax-WoS9Ojlg";
const bot = new Telegraf(botToken);

function getMenu() {
  return Markup.keyboard([
    [{text: "Моя геопозиция 📡", request_location: true}, "В начало ⤴️"],
  ]).resize();
}

bot.start((ctx) => {
  ctx.replyWithHTML(
    `Привет, <b>${ctx.chat.first_name}</b>. Я помогу найти тебе банкомат! Отправь свою геопозицию`, 
    getMenu()
  );
});

bot.hears("В начало ⤴️", ctx => ctx.replyWithHTML(
  `Привет, <b>${ctx.chat.first_name}</b>. Я помогу найти тебе банкомат! Отправь свою геопозицию`, 
    getMenu()
  ))


let myLatitude = ""
let myLongitude = ""


bot.on("location", (ctx) => {
  myLatitude = ctx.message.location.latitude
  myLongitude = ctx.message.location.longitude
    const ATMS = getData(optionsAtms)
    ATMS.then(res => {
      let atmArray = getNearestAtm(ctx.message.location.latitude, ctx.message.location.longitude, res.data.atms.filter(function(item) {
        if(item.publicAccess == 1 || item.publicAccess == 3) {
            return item
        }
    }), 3)
      ctx.replyWithHTML(`
🏧 <b>${atmArray[0].id}</b>
🏙️ <b>Город:</b> ${atmArray[0].city}
🏢 <b>Адрес:</b> ${atmArray[0].address} ${atmArray[0].addressComments || ""}`, {reply_markup: {inline_keyboard: [[{text: "Подробнее", callback_data: 'moreDetails'}]]}}
      )
      
      ctx.replyWithHTML(`
🏧 <b>${atmArray[1].id}</b>
🏙️ <b>Город:</b> ${atmArray[1].city}
🏢 <b>Адрес:</b> ${atmArray[1].address} ${atmArray[1].addressComments || ""}`, {reply_markup: {inline_keyboard: [[{text: "Подробнее", callback_data: 'moreDetails1'}]]}}
      )
      
      ctx.replyWithHTML(`
🏧 <b>${atmArray[2].id}</b>
🏙️ <b>Город:</b> ${atmArray[2].city}
🏢 <b>Адрес:</b> ${atmArray[2].address} ${atmArray[2].addressComments || ""}`, {reply_markup: {inline_keyboard: [[{text: "Подробнее", callback_data: 'moreDetails2'}]]}}
      )
    })
});

bot.on('callback_query', (ctx) => {
  if(ctx.update.callback_query.data === 'moreDetails') {
    const ATMS = getData(optionsAtms)
    ATMS.then(res => {
      let atmArray = getNearestAtm(myLatitude, myLongitude, res.data.atms.filter(function(item) {
        if(item.publicAccess == 1 || item.publicAccess == 3) {
            return item
        }
    }), 3)
    ctx.replyWithHTML(`🏧 <b>${atmArray[0].id}</b>
🏙️ <b>Город:</b> ${atmArray[0].city}
🏢 <b>Адрес:</b> ${atmArray[0].address} ${atmArray[0].addressComments || ""}
🧲 <b>NFC:</b> ${(atmArray[0].nfc) === "Y" ? "Да" : "Нет"}
💸 <b>Снятие:</b> ${(atmArray[0].cashOut) === "Y" ? "Да" : "Нет"}
💸 <b>Приём:</b> ${(atmArray[0].cashIn) === "Y" ? "Да" : "Нет"}
💳 <b>Платежи картой:</b> ${(atmArray[0].cardPayments) === "Y" ? "Да" : "Нет"}
💵 <b>Платежи наличными:</b> ${(atmArray[0].payments) === "Y" ? "Да" : "Нет"}`, {reply_markup: {inline_keyboard: [[{text: "Показать на карте", callback_data: 'card'}]]}}
          )
    })
  }

  if(ctx.update.callback_query.data === 'moreDetails1') {
    const ATMS = getData(optionsAtms)
    ATMS.then(res => {
      let atmArray = getNearestAtm(myLatitude, myLongitude, res.data.atms.filter(function(item) {
        if(item.publicAccess == 1 || item.publicAccess == 3) {
            return item
        }
    }), 3)
    ctx.replyWithHTML(`🏧 <b>${atmArray[1].id}</b>
🏙️ <b>Город:</b> ${atmArray[1].city}
🏢 <b>Адрес:</b> ${atmArray[1].address} ${atmArray[1].addressComments || ""}
🧲 <b>NFC:</b> ${(atmArray[1].nfc) === "Y" ? "Да" : "Нет"}
💸 <b>Снятие:</b> ${(atmArray[1].cashOut) === "Y" ? "Да" : "Нет"}
💸 <b>Приём:</b> ${(atmArray[1].cashIn) === "Y" ? "Да" : "Нет"}
💳 <b>Платежи картой:</b> ${(atmArray[1].cardPayments) === "Y" ? "Да" : "Нет"}
💵 <b>Платежи наличными:</b> ${(atmArray[1].payments) === "Y" ? "Да" : "Нет"}`, {reply_markup: {inline_keyboard: [[{text: "Показать на карте", callback_data: 'card1'}]]}}
          )
    })
  }

  if(ctx.update.callback_query.data === 'moreDetails2') {
    const ATMS = getData(optionsAtms)
    ATMS.then(res => {
      let atmArray = getNearestAtm(myLatitude, myLongitude, res.data.atms.filter(function(item) {
        if(item.publicAccess == 1 || item.publicAccess == 3) {
            return item
        }
    }), 3)
    ctx.replyWithHTML(`🏧 <b>${atmArray[2].id}</b>
🏙️ <b>Город:</b> ${atmArray[2].city}
🏢 <b>Адрес:</b> ${atmArray[2].address} ${atmArray[2].addressComments || ""}
🧲 <b>NFC:</b> ${(atmArray[2].nfc) === "Y" ? "Да" : "Нет"}
💸 <b>Снятие:</b> ${(atmArray[2].cashOut) === "Y" ? "Да" : "Нет"}
💸 <b>Приём:</b> ${(atmArray[2].cashIn) === "Y" ? "Да" : "Нет"}
💳 <b>Платежи картой:</b> ${(atmArray[2].cardPayments) === "Y" ? "Да" : "Нет"}
💵 <b>Платежи наличными:</b> ${(atmArray[2].payments) === "Y" ? "Да" : "Нет"}`, {reply_markup: {inline_keyboard: [[{text: "Показать на карте", callback_data: 'card2'}]]}}
          )
    })
  }

  if(ctx.update.callback_query.data === 'card') {
    const ATMS = getData(optionsAtms)
    ATMS.then(res => {
      let atmArray = getNearestAtm(myLatitude, myLongitude, res.data.atms.filter(function(item) {
        if(item.publicAccess == 1 || item.publicAccess == 3) {
            return item
        }
    }), 3)
      ctx.replyWithLocation(atmArray[0].latitude, atmArray[0].longitude)
    })
  }

  if(ctx.update.callback_query.data === 'card1') {
    const ATMS = getData(optionsAtms)
    ATMS.then(res => {
      let atmArray = getNearestAtm(myLatitude, myLongitude, res.data.atms.filter(function(item) {
        if(item.publicAccess == 1 || item.publicAccess == 3) {
            return item
        }
    }), 3)
      ctx.replyWithLocation(atmArray[1].latitude, atmArray[1].longitude)
    })
  }

  if(ctx.update.callback_query.data === 'card2') {
    const ATMS = getData(optionsAtms)
    ATMS.then(res => {
      let atmArray = getNearestAtm(myLatitude, myLongitude, res.data.atms.filter(function(item) {
        if(item.publicAccess == 1 || item.publicAccess == 3) {
            return item
        }
    }), 3)
      ctx.replyWithLocation(atmArray[2].latitude, atmArray[2].longitude)
    })
  }
});

bot.launch();
