const express = require('express');
const router = express.Router();
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
    const orders = await Order.aggregate([
      {
        $group: {
          _id: '$productId',
          totalQuantity: { $sum: '$quantity' },
          orders: { $push: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'products', 
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      }
    ]);

    sendResponse(res, 200, 'รายการออเดอร์ทั้งหมด', orders);
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
});

module.exports = router;
