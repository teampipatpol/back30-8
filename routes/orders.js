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

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toISOString().slice(0, 19).replace('T', ' '); 
};

router.get('/', async (req, res) => {
  try {
    const orders = await Order.aggregate([
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
          _id: '$billId',
          products: {
            $push: {
              productId: '$productDetails._id',
              billId :'$billId',
              name: '$productDetails.name',
              price: '$productDetails.price',
              quantity: '$quantity',
              status: '$status',

              totalPrice: { $multiply: ['$quantity', '$productDetails.price'] },
              image: '$productDetails.image',
            }
          },
          totalAmount: { $sum: { $multiply: ['$quantity', '$productDetails.price'] } },
          totalQuantity: { $sum: '$quantity' },
          soldAt: { $first: '$soldAt' }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    orders.forEach(order => {
      order._id = formatDate(order._id);
    });

    sendResponse(res, 200, 'รายการขายตามหมายเลขบิล', orders);
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
});

module.exports = router;
