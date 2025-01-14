const Sequelize = require('sequelize');
const Rooms = require("../../models/rooms.models");
const Orders = require("../../models/orders.models");
const Facility = require("../../models/facility.models");
const Rule = require("../../models/rule.models");
const Image = require("../../models/image.models");
const Category = require("../../models/category.models");
const { Op } = require('sequelize');
const { decode } = require('html-entities');

class roomController {
    //[GET] /phong-nghi
    async viewAll(req, res) {
        try {
            const perPage = 5; // Số lượng phòng hiển thị mỗi trang
            const page = parseInt(req.query.trang) || 1; // Trang hiện tại

            let { keyword = "", chuyenmuc, facility = [], thanhpho = "", quanhuyen = "", xaphuong = "" } = req.query;

            // Khởi tạo bộ lọc
            const filters = {
                Status: 1, // Chỉ hiển thị các phòng đang hoạt động
            };

            // Thêm điều kiện lọc theo từ khóa
            if (keyword) {
                filters.Name = { [Op.like]: `%${keyword}%` };
            }

            // Thêm điều kiện lọc theo chuyên mục
            if (chuyenmuc) {
                filters.CategoryId = chuyenmuc;
            }

            // Truy vấn danh sách chuyên mục
            const categoryList = await Category.findAll({
                where: {
                    type: 2, // Điều kiện lọc type = 2
                },
            });

            // Thêm điều kiện lọc theo địa chỉ
            if (thanhpho || quanhuyen || xaphuong) {
                thanhpho = thanhpho.replace(/(Tỉnh|Thành phố)/, "").trim();
                quanhuyen = quanhuyen.replace(/(Quận|Huyện|Thành phố)/, "").trim();
                xaphuong = xaphuong.replace(/(Xã|Phường|Thị trấn)/, "").trim();

                const address = xaphuong + ", " + quanhuyen;

                filters.Address = { [Op.like]: `%${address}%` }; // Ghép các phần tử lại thành một chuỗi và tìm kiếm

                // Lấy danh sách phòng kèm số lượng
                const { count, rows: roomList } = await Rooms.findAndCountAll({
                    where: filters,
                    limit: perPage,
                    offset: (page - 1) * perPage,
                    order: [["Id", "DESC"]], // Sắp xếp theo Id giảm dần
                });

                const totalPages = Math.ceil(count / perPage);

                console.log(roomList);

                if(roomList.length <= 0){
                    return res.redirect('/?error=Không tìm thấy phòng nào phù hợp!');
                }

                // Thêm thông tin tiện ích cho từng phòng
                for (let room of roomList) {
                    const facilityInfo = await Facility.findOne({ where: { RoomId: room.Id } });

                    // Cập nhật thông tin tiện ích và rút gọn mô tả
                    room.Bed = facilityInfo ? facilityInfo.Bed : null;
                    room.Description = decode(room.Description.replace(/<[^>]+>/g, '')).substring(0, 60) + ' ...';
                }

                // Render giao diện danh sách phòng
                return res.render("website/room/all", {
                    roomList,
                    totalPages,
                    currentPage: page,
                    title: "Hosteller - Danh sách phòng nghỉ",
                    keyword,
                    chuyenmuc,
                    categoryList, // Truyền danh sách chuyên mục vào view
                    selectedCategory: chuyenmuc || null, // Chuyên mục được chọn (nếu có)
                    selectedFacilities: facility || [], // Tiện nghi đã chọn
                });
            }

            // Tạo điều kiện lọc theo tiện nghi
            let facilityConditions = [];
            if (facility && Array.isArray(facility)) {
                facility.forEach((fac) => {
                    const [key, value] = fac.split(',');
                    facilityConditions.push({ [key]: value });
                });
            }

            // Lấy danh sách phòng kèm số lượng
            const { count, rows: roomList } = await Rooms.findAndCountAll({
                where: filters,
                limit: perPage,
                offset: (page - 1) * perPage,
                order: [["Id", "DESC"]], // Sắp xếp theo Id giảm dần
                include: facilityConditions.length
                    ? [
                        {
                            model: Facility,
                            where: {
                                [Op.and]: facilityConditions,
                            },
                        },
                    ]
                    : [],
            });

            const totalPages = Math.ceil(count / perPage);

            // Thêm thông tin tiện ích cho từng phòng
            for (const room of roomList) {
                const facilityInfo = await Facility.findOne({ where: { RoomId: room.Id } });

                // Cập nhật thông tin tiện ích và rút gọn mô tả
                room.Bed = facilityInfo ? facilityInfo.Bed : null;
                room.Description = decode(room.Description.replace(/<[^>]+>/g, '')).substring(0, 60) + ' ...';
            }

            if (roomList.length <= 0) {
                const filters2 = {
                    Status: 1, // Chỉ hiển thị các phòng đang hoạt động
                };

                // Lấy danh sách phòng kèm số lượng
                let { count, rows: roomList } = await Rooms.findAndCountAll({
                    where: filters2,
                    limit: perPage,
                    offset: (page - 1) * perPage,
                    order: [["Id", "DESC"]], // Sắp xếp theo Id giảm dần
                });

                let totalPages = Math.ceil(count / perPage);

                // Thêm thông tin tiện ích cho từng phòng
                for (let room of roomList) {
                    const facilityInfo = await Facility.findOne({ where: { RoomId: room.Id } });

                    // Cập nhật thông tin tiện ích và rút gọn mô tả
                    room.Bed = facilityInfo ? facilityInfo.Bed : null;
                    room.Description = decode(room.Description.replace(/<[^>]+>/g, '')).substring(0, 60) + ' ...';
                }

                // Render giao diện danh sách phòng
                return res.render("website/room/all", {
                    roomList,
                    totalPages,
                    currentPage: page,
                    title: "Hosteller - Danh sách phòng nghỉ",
                    keyword,
                    chuyenmuc,
                    categoryList, // Truyền danh sách chuyên mục vào view
                    selectedCategory: chuyenmuc || null, // Chuyên mục được chọn (nếu có)
                    selectedFacilities: facility || [], // Tiện nghi đã chọn
                });
            }

            // Render giao diện danh sách phòng
            return res.render("website/room/all", {
                roomList,
                totalPages,
                currentPage: page,
                title: "Hosteller - Danh sách phòng nghỉ",
                keyword,
                chuyenmuc,
                categoryList, // Truyền danh sách chuyên mục vào view
                selectedCategory: chuyenmuc || null, // Chuyên mục được chọn (nếu có)
                selectedFacilities: facility || [], // Tiện nghi đã chọn
            });
        } catch (err) {
            console.error("Error in viewAll:", err);
            return res.status(500).send("Đã xảy ra lỗi khi tải danh sách phòng.");
        }
    }


    //[GET] /phong-nghi/:slug
    async viewDetail(req, res) {
        const { id } = req.params;
        try {
            const room = await Rooms.findOne({ where: { slug: id, Status: 1 } });
            if (!room) {
                return res.render('website/error/index');
            }

            const facility = await Facility.findAll({
                where: { RoomId: room.Id }
            });

            const rule = await Rule.findAll({
                where: { RoomId: room.Id }
            });

            const image = await Image.findAll({
                where: { RoomId: room.Id }
            });

            const related = await Rooms.findAll({
                where: { CategoryId: room.CategoryId },
                include: [Facility], //Lấy kèm theo Facility tương ứng
                order: Sequelize.literal('RAND()'), // Sử dụng hàm RAND() để sắp xếp ngẫu nhiên
                limit: 4 // Lấy ra 4 bản ghi
            });

            return res.render('website/room/detail', {room,facility,rule,image,related,title: "Hosteller - " + room.Name});
        } catch (err) {
            console.error(err);
            return res.status(500).send("Đã xảy ra lỗi khi tải chi tiết phòng.");
        }
    }

}

module.exports = new roomController();
