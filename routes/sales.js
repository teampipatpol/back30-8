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

router.get('/sales', async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $group: {
          _id: '$_id', // Group by order ID
          items: {
            $push: {
              productId: '$productDetails._id',
              productName: '$productDetails.name',
              quantity: '$quantity',
              price: '$productDetails.price',
              totalPrice: { $multiply: ['$quantity', '$productDetails.price'] }
            }
          },
          orderTotal: { $sum: { $multiply: ['$quantity', '$productDetails.price'] } }
        }
      }
    ]);

    sendResponse(res, 200, 'ข้อมูลการขายทั้งหมด', salesData);
  } catch (error) {
    sendResponse(res, 500, error.message, null);
  }
});

module.exports = router;
