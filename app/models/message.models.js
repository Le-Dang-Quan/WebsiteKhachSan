const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config.js");

const Message = sequelize.define("Message", {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  OrderId : {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  IsAdmin: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Message: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: "message" 
});

module.exports = Message;
