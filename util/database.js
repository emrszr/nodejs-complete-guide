const Sequelize = require("sequelize").Sequelize;
const sequelize = new Sequelize("node-complete", "root", "135246!.", {
  dialect: "mysql",
  host: "localhost",
});



module.exports = sequelize;
