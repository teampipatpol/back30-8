// const express = require('express');
// const router = express.Router();
// const ProductType = require('../models/producttype'); // Ensure this path is correct

// // Example route for adding a product type
// router.post('/', async (req, res) => {
//     const { type } = req.body;
//     if (!type) {
//         return res.status(400).json({ message: 'กรุณาระบุชื่อประเภทสินค้า' });
//     }
//     try {
//         const newType = new ProductType({ type });
//         await newType.save();
//         return res.status(201).json({ message: 'เพิ่มประเภทสินค้าเรียบร้อยแล้ว', newType });
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// });

// // Example route for fetching product types
// router.get('/', async (req, res) => {
//     try {
//         const types = await ProductType.find();
//         return res.status(200).json({ message: 'รายการประเภทสินค้า', types });
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// });

// module.exports = router;
