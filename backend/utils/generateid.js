const generateId = () => {
  return Math.floor(100000 + Math.random() * 9000000); //9
};

module.exports = generateId;
