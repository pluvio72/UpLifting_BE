function convertToKilos(pounds) {
  const kilos = pounds * 0.45359;
  return Math.round(kilos * 10) / 10;
};

module.exports = {
  convertToKilos
};