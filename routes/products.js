const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Order = require('../models/order');

const sendResponse = (res, statusCode, message, data) => {
  res.status(statusCode).json({
    status: statusCode,
    message: message,
    data: data
  });
};

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    sendResponse(res, 200, 'success', products);
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    console.log("product "+product)

    if (!product) return sendResponse(res, 400, 'หาสินค้าไม่เจอ', null);
    
    sendResponse(res, 200, 'ข้อมูลสินค้าชิ้นนี้คือ', product);
  } catch (error) {
    sendResponse(res, 500, error.message, null);
  }
});

router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    sendResponse(res, 200, 'success', product);
  } catch (error) {
    sendResponse(res, 500, error.message, null);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return sendResponse(res, 400, 'หาสินค้าไม่เจอ', null);
    sendResponse(res, 200, 'อัพเดทสินค้าเรียบร้อยแล้ว', product);
  } catch (error) {
    sendResponse(res, 500, error.message, null);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return sendResponse(res, 400, 'หาสินค้าไม่เจอ', null);
    sendResponse(res, 200, 'ลบสินค้าแล้ว', null);
  } catch (error) {
    sendResponse(res, 500, error.message, null);
  }
});

router.post('/:id/orders', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendResponse(res, 400, 'หาสินค้าไม่เจอ', null);

    if (product.stock < req.body.quantity) {
      return sendResponse(res, 400, `จำนวนสินค้าไม่พอในออเดอร์นี้ กรุณาลองใหม่อีกครั้ง จำนวนคงเหลือ = ${product.stock}`, null);
    }

    const order = new Order({
      productId: req.params.id,
      quantity: req.body.quantity,
    });

    await order.save();

    product.stock -= req.body.quantity;
    await product.save();

    sendResponse(res, 201, `ขายสำเร็จ จำนวน ${req.body.quantity}`, order);
  } catch (error) {
    sendResponse(res, 500, error.message, null);
  }
});

router.get('/:id/orders', async (req, res) => {
  try {
    const orders = await Order.find({ productId: req.params.id });
    if (!orders.length) return sendResponse(res, 400, 'ยังไม่มีรายการขายสำหรับสินค้าชิ้นนี้');
    sendResponse(res, 200, 'ออเดอร์ที่ขายทั้งหมดของสินค้าชิ้นนี้', orders);
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
});

module.exports = router;
