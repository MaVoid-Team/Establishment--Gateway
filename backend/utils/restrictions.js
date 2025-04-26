const catchAsync = require("./catchAsync");

const restrict = async (model, role, fields, where) => {
  if (role < 6 && role >= 2) {
    const data = await model.findAll({
      where: where? {
        ...where,
      }: {},
      attributes: fields,
    });

    return data;
  }
  return null;
};

module.exports = restrict;
