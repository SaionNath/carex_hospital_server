const generateUserId = () => {

  const randomNumber =
    Math.floor(100000 + Math.random() * 900000);

  return `CRX-${randomNumber}`;
};

module.exports = generateUserId;