const Sequelize = require('sequelize');
const Message = require("../../models/message.models");
const Order = require("../../models/orders.models");
const Room = require("../../models/rooms.models");
const Admin = require("../../models/admin.models");

class messageController {

    //[GET] /tin-nhan/:id
    async index(req, res) {
        const Code = req.params.id;

        const order = await Order.findOne({ where: { Code: Code } });
        const room = await Room.findOne({ where: { Id: order.RoomId } });
        const admin = await Admin.findOne({ where: { Id: room.AdminId } });
        const messages = await Message.findAll({ where: { OrderId: order.Id }, order: [['Id', 'ASC']] });
        const lastMessage = await Message.findOne({
            where: { OrderId: order.Id },
            order: [['Id', 'DESC']], // Sắp xếp giảm dần theo `Id` để lấy tin nhắn cuối cùng
            limit: 1
          });
        
        const lastMessageId = lastMessage ? lastMessage.Id : null;

        return res.render('website/message/index', {title: "Hosteller - Tin nhắn khách hàng", error:"", success:"", lastMessageId, orderId: order.Id, orderCode: order.Code, admin: admin, messages: messages, room: room});
    }

    //[GET] /tin-nhan/:id/admin
    async indexAdmin(req, res) {
        const Code = req.params.id;

        const order = await Order.findOne({ where: { Code: Code } });
        const room = await Room.findOne({ where: { Id: order.RoomId } });
        const admin = await Admin.findOne({ where: { Id: room.AdminId } });
        const messages = await Message.findAll({ where: { OrderId: order.Id }, order: [['Id', 'ASC']] });
        const lastMessage = await Message.findOne({
            where: { OrderId: order.Id },
            order: [['Id', 'DESC']], // Sắp xếp giảm dần theo `Id` để lấy tin nhắn cuối cùng
            limit: 1
          });
        
        const lastMessageId = lastMessage ? lastMessage.Id : null;

        return res.render('website/message/admin', {title: "Hosteller - Tin nhắn khách hàng", error:"", success:"", order: order, lastMessageId, orderId: order.Id, orderCode: order.Code, admin: admin, messages: messages, room: room});
    }


    //[POST] /tin-nhan/:id
    async postMessage(req, res) {
        try {
            const { message, isAdmin = 0 } = req.body;  // Lấy tin nhắn từ client gửi lên
            const { id } = req.params; // Lấy OrderId từ URL
    
            // Lưu tin nhắn vào cơ sở dữ liệu
            const newMessage = await Message.create({
                OrderId: id,   // Gắn OrderId từ URL
                IsAdmin: isAdmin,    // Mặc định là tin nhắn của người dùng (nếu bạn cần kiểm tra thêm, có thể thay đổi)
                Message: message
            });
    
            // Trả về phản hồi thành công
            res.status(200).json({
                success: true,
                message: 'Tin nhắn đã được gửi thành công!',
                data: newMessage
            });
        } catch (error) {
            // Trả về lỗi nếu có
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
            });
        }
    }

    async getNewMessages(req, res) {
        try {
            const { id } = req.params; // Lấy OrderId từ URL
            const lastId = req.query.lastId; // Thời gian kiểm tra lần trước
    
            const messages = await Message.findAll({
                where: {
                    OrderId: id,
                    Id: { [Sequelize.Op.gt]: lastId } 
                },
                order: [['createdAt', 'ASC']]
            });

            let lastMessageId = lastId;

            if(messages){
                const lastMessage = await Message.findOne({
                    where: { OrderId: id },
                    order: [['Id', 'DESC']], // Sắp xếp giảm dần theo `Id` để lấy tin nhắn cuối cùng
                    limit: 1
                });
                
                lastMessageId = lastMessage ? lastMessage.Id : lastId;
            }

            res.status(200).json({
                success: true,
                data: messages,
                lastId: lastMessageId
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
            });
        }
    }

}

module.exports = new messageController();
