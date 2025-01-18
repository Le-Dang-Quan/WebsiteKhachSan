const Sequelize = require('sequelize');
const sequelize = new Sequelize('zpwmkh7e6o5f_hotel_nodejs', 'zpwmkh7e6o5f_root', 'Matkhau123@', {
  dialect: 'mysql',
  host: '137.59.105.46',
  logging: false, // tắt log
});

module.exports = sequelize;
