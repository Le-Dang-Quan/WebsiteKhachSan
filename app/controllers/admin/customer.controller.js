const Customer = require("../../models/customer.models");
const sequelize = require('../../config/db.config');
const { Sequelize } = require('sequelize');
const { Op } = require("sequelize");
const Rooms = require("../../models/rooms.models");
const Orders = require("../../models/orders.models");

class customerController {
  //[GET] /admin/customer
  async index(req, res) {
    try {
      if(req.session.admin.Role == 0){
        const perPage = 10; // Số khách hàng trên mỗi trang
        const page = parseInt(req.query.page) || 1;

        const adminId = req.session.admin.Id;

        // Truy vấn thủ công để sắp xếp theo createdAt trước khi GROUP BY
        const subQuery = `
          SELECT 
            orders.Phone, 
            orders.FullName, 
            orders.Email, 
            orders.createdAt
          FROM orders
          INNER JOIN rooms 
            ON orders.RoomId = rooms.Id AND rooms.AdminId = ${adminId}
          ORDER BY orders.createdAt DESC
        `;

        const mainQuery = `
          SELECT 
            sub.Phone,
            MAX(sub.FullName) AS FullName,
            MAX(sub.Email) AS Email,
            MAX(sub.createdAt) AS LastOrderDate
          FROM (${subQuery}) AS sub
          GROUP BY sub.Phone
          ORDER BY LastOrderDate DESC
          LIMIT ${perPage} OFFSET ${(page - 1) * perPage}
        `;

        const countQuery = `
          SELECT COUNT(DISTINCT orders.Phone) AS count
          FROM orders
          INNER JOIN rooms 
            ON orders.RoomId = rooms.Id AND rooms.AdminId = ${adminId}
        `;

          // Truy vấn dữ liệu chính
          const [customerList] = await sequelize.query(mainQuery, { raw: true });

          // Truy vấn tổng số khách hàng
          const [countResult] = await sequelize.query(countQuery, { raw: true });
          const totalRecords = countResult[0].count;
          const totalPages = Math.ceil(totalRecords / perPage);

          // Format lại ngày giờ cho mỗi khách hàng
          for (const customer of customerList) {
            const createdAtDate = new Date(customer.LastOrderDate);

            const d = createdAtDate.getDate() < 10 ? "0" + createdAtDate.getDate() : createdAtDate.getDate();
            const m = createdAtDate.getMonth() + 1 < 10 ? "0" + (createdAtDate.getMonth() + 1) : createdAtDate.getMonth() + 1;
            const y = createdAtDate.getFullYear();

            const h = createdAtDate.getHours() < 10 ? "0" + createdAtDate.getHours() : createdAtDate.getHours();
            const min = createdAtDate.getMinutes() < 10 ? "0" + createdAtDate.getMinutes() : createdAtDate.getMinutes();
            const sec = createdAtDate.getSeconds() < 10 ? "0" + createdAtDate.getSeconds() : createdAtDate.getSeconds();

            customer.created = `${d}-${m}-${y} ${h}:${min}:${sec}`;
          }

          // Trả về dữ liệu
          return res.render("admin/customer/index", {
            customerList,
            totalPages,
            currentPage: page,
          });
      }

      const perPage = 10;
      const page = parseInt(req.query.page) || 1;

      const { count, rows: customerList } = await Customer.findAndCountAll({
        limit: perPage,
        offset: (page - 1) * perPage,
        order: [['Id', 'DESC']], // Thêm điều kiện ORDER BY Id DESC
      });

      const totalPages = Math.ceil(count / perPage);

      for (const customer of customerList) {
        const createdAtDate = new Date(customer.createdAt);
    
        const d = createdAtDate.getDate() < 10 ? "0" + createdAtDate.getDate() : createdAtDate.getDate();
        const m = (createdAtDate.getMonth() + 1) < 10 ? "0" + (createdAtDate.getMonth() + 1) : (createdAtDate.getMonth() + 1);
        const y = createdAtDate.getFullYear();
        
        const h = createdAtDate.getHours() < 10 ? "0" + createdAtDate.getHours() : createdAtDate.getHours();
        const min = createdAtDate.getMinutes() < 10 ? "0" + createdAtDate.getMinutes() : createdAtDate.getMinutes();
        const sec = createdAtDate.getSeconds() < 10 ? "0" + createdAtDate.getSeconds() : createdAtDate.getSeconds();

        customer.created = `${d}-${m}-${y} ${h}:${min}:${sec}`;
      }

      return res.render('admin/customer/index', { customerList, totalPages, currentPage: page });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi tải khách hàng.");
    }
  }

}

module.exports = new customerController();
