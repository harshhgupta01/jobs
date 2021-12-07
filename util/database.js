const Sequelize = require("sequelize");

const sequelize = new Sequelize("job", "root", "root", {
  dialect: "mysql",
});

module.exports = sequelize;
