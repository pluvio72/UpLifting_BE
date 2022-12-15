function convertToKilos(pounds) {
  const kilos = pounds * 0.45359;
  return Math.round(kilos * 100) / 100;
};

function convertToPounds(kilos) {
  const pounds = kilos * 2.20462;
  return Math.round(pounds * 100) / 100;
}

module.exports = {
  convertToKilos,
  convertToPounds,
};