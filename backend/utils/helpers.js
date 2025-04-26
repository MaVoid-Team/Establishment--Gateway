//Helper functions
const bcrypt = require("bcrypt");

exports.encryptPassword = async (password) => {
  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

exports.comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

