const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config.js");

const Settings = sequelize.define("settings", {
  AdminId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  QrCode: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: "settings" 
});

module.exports = Settings;
