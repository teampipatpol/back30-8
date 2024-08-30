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
          _id: {
            time: {
              $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$soldAt" }
            }
          },
          products: {
            $push: {
              name: '$productDetails.name',
              price: '$productDetails.price',
              quantity: '$quantity',
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
        $group: {
          _id: { $substr: ['$_id.time', 0, 19] }, // Group by date and time up to seconds
          bills: {
            $push: {
              billId: '$_id.time',
              products: '$products',
              totalAmount: '$totalAmount',
              totalQuantity: '$totalQuantity',
              soldAt: '$_id.time'
            }
          },
          dailyTotal: { $sum: '$totalAmount' },
          dailyQuantity: { $sum: '$totalQuantity' }
        }
      },
      {
        $sort: { _id: -1 } // Sort by the most recent dates
      }
    ]);

    sendResponse(res, 200, 'รายการขายในแต่ละวัน', orders);
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
});

module.exports = router;
