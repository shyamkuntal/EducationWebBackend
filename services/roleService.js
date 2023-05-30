const { Roles } = require("../models/User");

const findRoleByName = async (roleName) => {
  try {
    let roleDetails = await Roles.findOne({
      where: { roleName: roleName },
      raw: true,
    });

    return roleDetails;
  } catch (err) {
    throw err;
  }
};

module.exports = { findRoleByName };
