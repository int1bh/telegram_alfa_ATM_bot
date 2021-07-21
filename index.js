const { Telegraf, Markup } = require("telegraf");

const request = require('request');
const X_IBM_Client_Id = '93f0bffa-8c93-4694-a9ff-7383967088b5'
const X_CLIENT_CERTIFICATE = '-----BEGIN CERTIFICATE-----MIIFIzCCAwugAwIBAgICEBkwDQYJKoZIhvcNAQELBQAwgakxCzAJBgNVBAYTAlJVMQ8wDQYDVQQIDAbQnNCh0JoxFTATBgNVBAcMDNCc0L7RgdC60LLQsDEcMBoGA1UECgwT0JDQu9GM0YTQsCDQkdCw0L3QujEOMAwGA1UEAwwFYXBpY2ExJTAjBgkqhkiG9w0BCQEWFmFwaXN1cHBvcnRAYWxmYWJhbmsucnUxDzANBggqhQMDgQMBARIBMDEMMAoGBSqFA2QDEgEwMB4XDTE4MDQyMzA2NDIwN1oXDTMxMTIzMTA2NDIwN1owgaAxCzAJBgNVBAYTAlJVMQwwCgYDVQQIDANNU0sxEjAQBgNVBAoMCUFsZmEgQmFuazEWMBQGA1UEAwwNYXBpZGV2ZWxvcGVyczElMCMGCSqGSIb3DQEJARYWYXBpc3VwcG9ydEBhbGZhYmFuay5ydTEPMA0GCCqFAwOBAwEBEgEwMQwwCgYFKoUDZAMSATAxETAPBgorBgEEAYGCaWQBDAEwMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6+wUdr+1nyb6gxg7E6HzzR48rE25js5/fpM5GOoGVFfgT502XdSHXdYGDT3OPsNix2nBfPOppzDZdOJQbk+XPQ6Bj8u8FRkkd6gRSLQQbLLDe/C2IDhGxuFHeQWVvb7PL/w7srAxH0SOVEJgn/8tD5D9FaoFN6NaUk34eb/tojZJpbydhx+eWFtBXtrxEtESbGyTm2X7Q2VG36PqCwQdgdNwf6JUN8dIYotG+4rEJp1xsDqf7U8I5VoT1sE7rAY6fEHuThHtENCd5JLqRiFqVSbSsxXhO5COofkUeXBfnUxD9/auSdwqX+6DdhS6HWcN3P4nBLjlVM0M7P6t8fIQGwIDAQABo1wwWjBABgNVHR8EOTA3MDWgM6Axhi9odHRwOi8vYXBpY2EubW9zY293LmFsZmFpbnRyYS5uZXQvYXBpY2EuY3JsLnBlbTAJBgNVHRMEAjAAMAsGA1UdDwQEAwIF4DANBgkqhkiG9w0BAQsFAAOCAgEANbGOlIxDFxfqigiqWuRpnsg7vgqRbCSy1HpkTs8y2XNdG6jsxA3a42vQCWy74cXmEXrf7m9BQBh3HIck4Ag5azo1+svwJmExhVx3P7RdmP4DuqO1XsWLPJmaeMWFDm71PO2N1vLOtsymnp71JPBV+x6mY9S0ecW37ZdrCUjKgWnxIijneLTF3NIkaNoB6WPdlasPF+KmATv8eMuTZj27e9xLVikTC+5mBtM8mQiWYP4dStcOI7TO810/6PJkekjPYNV5ldzSif+ER3y9U0x/sdaRmnR9vCw7geEKtum3JMv6uqYumaqMeB8ZEUEkZdgLFgGzDc10VuROwqN89qA8wQV7gN2nlQ7NdcrLcyq1NLH5EYP9AjgR47Ure93rOJvrr8w7c+WpYIGMEjtMySrIiRtYtDrxTH/jZPUFoKRphyQ3s4Ja/86L8ONSBFm/F9TAGqrzaMrhHM1nlX8fNl6BLBVFN7iDjvAzTCrIrG/fOh6MI1R1icbjiREWBzcij7lyENqLzQUZQiLxSQLQ7dKd6YkjNmMl+TL4Z7HAyiaJzOuypKX5g6q+KoH10LXUB5pq+8tGI7J3K06lrF28VZd8TPzOgll/N/Gz9Ce8eOoQG+dOS0Omv5Bz1cstue4I0+NuE+vVcQIkQPQTYzGbty5dALrDx1II4VsZnzjmJaqzq98=-----END CERTIFICATE-----'

const options = {
  method: 'GET',
  url: 'https://apiws.alfabank.ru/alfabank/alfadevportal/atm-service/atms/status',
  headers: {'x-ibm-client-id': X_IBM_Client_Id, 'x-client-certificate': X_CLIENT_CERTIFICATE, accept: 'application/json'}
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});

//request()

const botToken = '1930692856:AAGjghMGHBnryqcb8Y8iQx-rax-WoS9Ojlg';
const bot = new Telegraf(botToken);

function getMenu() {
    return Markup.keyboard([
        [{text: 'Локация', request_location: true}, 'Положить','Снять']
    ]).resize()
}

bot.start((ctx) => {
    ctx.replyWithHTML(`Привет, <b>${ctx.chat.first_name}</b>. Я помогу найти тебе банкомат!`, getMenu())
    console.log(ctx);
})

bot.hears(
    'Положить', (ctx) =>
    ctx.reply('Ближайшие АТМ на внесение')
)

bot.on('location', (ctx) => {
    ctx.reply(`Широта: ${ctx.message.location.latitude} Долгота: ${ctx.message.location.longitude}`)
})

bot.launch()