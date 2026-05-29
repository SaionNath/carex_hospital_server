const generatePatientId = () => {

  const randomNumber =
    Math.floor(100000 + Math.random() * 900000);

  return `PAT-${randomNumber}`;
};

module.exports = generatePatientId;