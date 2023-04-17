const qrcode = require("qrcode-terminal");
const cron = require("node-cron");
const fs = require("fs");
const axios = require("axios");
const dotenv = require("dotenv");
const unsplash = require("unsplash-js");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const horoscope = require("./util/horoscope");

dotenv.config();

const unsplash_access_key = process.env.UNSPLASH_ACCESS_KEY;

const API = unsplash.createApi({
  accessKey: unsplash_access_key,
});

API.photos
  .getRandom({
    query: "nature",
    count: 1,
    featured: true,
    orientation: "landscape",
  })
  .then((result) => {
    let photoLink = result.response[0].links.download;

    const download_image = (url, image_path) =>
      axios({
        url,
        responseType: "stream",
      }).then(
        (response) =>
          new Promise((resolve, reject) => {
            response.data
              .pipe(fs.createWriteStream(image_path))
              .on("finish", () => resolve())
              .on("error", (e) => reject(e));
          })
      );

    download_image(photoLink, "image.jpg").then(() => {
      console.log("The file was saved!");
    });
  })
  .catch((err) => {
    console.log(err);
  });

const random_emojis = [];

const random_messages = [];

let emojiOne = random_emojis[Math.floor(Math.random() * random_emojis.length)];
let emojiTwo = random_emojis[Math.floor(Math.random() * random_emojis.length)];

let message =
  random_messages[Math.floor(Math.random() * random_messages.length)] +
  emojiOne +
  emojiTwo;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  let sheSign = "<She's sign>";
  let heSign = "<He's sign>";

  const media = MessageMedia.fromFilePath("./image.jpg");
  client.sendMessage("<Phone id>", media, {
    caption: message,
  });

  setTimeout(() => {
    horoscope.getHoroscope(sheSign).then((horoscope) => {
      let message = `*HOROSCOPE:* \n` + horoscope;
      client.sendMessage("<Phone id>", message);
    });
    horoscope.getHoroscope(heSign).then((horoscope) => {
      let message = `*HOROSCOPE:* \n` + horoscope;
      client.sendMessage("<phone id>", message);
    });
    setTimeout(() => {
      client.destroy();
    }, 10000);
  }, 5000);
});

cron.schedule("0 12 * * *", () => {
  client.initialize();
});
