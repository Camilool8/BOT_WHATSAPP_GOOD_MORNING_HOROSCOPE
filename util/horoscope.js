//web scrap this website: https://www.clarin.com/horoscopo/

const axios = require("axios");
const cheerio = require("cheerio");

const getHoroscope = async (sign) => {
  const response = await axios.get("https://www.clarin.com/horoscopo/");
  const $ = cheerio.load(response.data);
  const horoscope = $("#data-" + sign).text();
  return horoscope;
};

module.exports = { getHoroscope };
