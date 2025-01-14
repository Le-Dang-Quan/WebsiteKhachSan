const { Op } = require("sequelize");
const Orders = require("../../models/orders.models");
const Rooms = require("../../models/rooms.models");
const Category = require("../../models/category.models");

class dashboardController {
  //[GET] /admin/
  async index(req, res) {
    try {
      // Lấy ngày hiện tại
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Tổng số đơn hàng trong ngày (liên kết với Rooms để lọc theo AdminId)
      const ordersCount = await Orders.count({
        include: [
          {
            model: Rooms,
            as: "room",
            where: { AdminId: req.session.admin.Id }, // Điều kiện AdminId
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfToday,
            [Op.lt]: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
          },
        },
      });

      const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
      const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay()));

      // Tổng số đơn hàng trong tuần
      const ordersWeekCount = await Orders.count({
        include: [
          {
            model: Rooms,
            as: "room",
            where: { AdminId: req.session.admin.Id },
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfWeek,
            [Op.lt]: new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate() + 1),
          },
        },
      });

      // Tổng doanh thu trong ngày
      let totalForToday = await Orders.sum("Total", {
        include: [
          {
            model: Rooms,
            as: "room",
            where: { AdminId: req.session.admin.Id },
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfToday,
            [Op.lt]: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
          },
        },
      });

      // Tổng doanh thu trong tuần
      let totalForThisWeek = await Orders.sum("Total", {
        include: [
          {
            model: Rooms,
            as: "room",
            where: { AdminId: req.session.admin.Id },
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfWeek,
            [Op.lt]: new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate() + 1),
          },
        },
      });

      // Tổng số phòng trống
      const totalRoomsEmpty = await Rooms.count({
        where: {
          Status: 1,
          AdminId: req.session.admin.Id, // Điều kiện AdminId
        },
      });

      // Tổng số phòng thuộc Admin
      const totalRooms = await Rooms.count({
        where: { AdminId: req.session.admin.Id }, // Điều kiện AdminId
      });

      // Tổng số danh mục có Type = 2 (nếu danh mục liên kết với AdminId, cần thêm điều kiện tương ứng)
      const totalCategory = await Category.count({
        where: {
          Type: 2,
        },
      });

      totalForToday = parseInt(totalForToday || 0).toLocaleString("en-US");
      totalForThisWeek = parseInt(totalForThisWeek || 0).toLocaleString("en-US");

      return res.render("admin/dashboard/index", {
        ordersCount,
        ordersWeekCount,
        totalForToday,
        totalForThisWeek,
        totalRoomsEmpty,
        totalRooms,
        totalCategory,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi tải trang chủ.");
    }
  }

  //[GET] /admin/revenue
  async revenue(req, res) {
    const monthlyRevenue = [];

    try {
      // Lấy từng tổng doanh thu của các tháng từ tháng 1 đến tháng 12
      for (let month = 1; month <= 12; month++) {
        const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
        const endOfMonth = new Date(new Date().getFullYear(), month, 0);

        const totalRevenue = await Orders.sum("Total", {
          include: [
            {
              model: Rooms,
              as: "room",
              where: { AdminId: req.session.admin.Id }, // Điều kiện AdminId
            },
          ],
          where: {
            createdAt: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
        });

        monthlyRevenue.push(parseInt(totalRevenue || 0)); // Đưa tổng doanh thu của tháng vào mảng
      }

      return res.json(monthlyRevenue);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi lấy doanh thu hàng tháng.");
    }
  }
}

module.exports = new dashboardController();
