const express = require('express');
const multer = require('multer');

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
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });


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

router.post('/', upload.single('image'), async (req, res) => {
  const imageUrl = req.file ? req.file.path.replace(/\\/g, '/') : ''; 
  console.log('Image saved at:', imageUrl); 

  const product = new Product({
    ...req.body,
    image: imageUrl 
  });

  try {
    await product.save();
    sendResponse(res, 200, 'Product added successfully', product);
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
router.post('/orders/:billId/return', async (req, res) => {
  try {
    const { billId } = req.params;
    const { returnedItems } = req.body;

    if (!billId) {
      return sendResponse(res, 400, 'Bill ID is required', null);
    }

    if (!Array.isArray(returnedItems) || returnedItems.length === 0) {
      return sendResponse(res, 400, 'Returned items are required', null);
    }

    console.log('Received billId:', billId);
    console.log('Received returnedItems:', returnedItems); 

    const order = await Order.findOne({ billId });
    if (!order) {
      return sendResponse(res, 404, 'Order not found', null);
    }

    for (const item of returnedItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return sendResponse(res, 400, `Product with ID ${item.productId} not found`, null);
      }

      console.log(`Processing return for productId: ${item.productId}, quantity: ${item.quantity}`);

      product.stock += item.quantity;
      await product.save();
    }

    order.status = 'returned'; 
    await order.save();

    sendResponse(res, 200, 'Return processed successfully', null);
  } catch (error) {
    console.error('Error processing return:', error.message);
    sendResponse(res, 500, error.message, null);
  }
});

// router.post('/orders/:billId/return', async (req, res) => {
//   try {
//     const { billId } = req.params;
//     const { returnedItems } = req.body;

//     if (!billId) {
//       return sendResponse(res, 400, 'Bill ID is required', null);
//     }

//     if (!Array.isArray(returnedItems) || returnedItems.length === 0) {
//       return sendResponse(res, 400, 'Returned items are required', null);
//     }

//     // Find the order by billId
//     const order = await Order.findOne({ billId });
//     if (!order) {
//       return sendResponse(res, 404, 'Order not found', null);
//     }

//     // Iterate over the returned items and update stock
//     for (const item of returnedItems) {
//       const product = await Product.findById(item.productId);
//       if (!product) {
//         return sendResponse(res, 400, `Product with ID ${item.productId} not found`, null);
//       }

//       // Increase the stock by the quantity of returned items
//       product.stock += item.quantity;
//       await product.save();
//     }

//     // Optionally, update the order status to "returned" or similar
//     order.status = 'returned'; // or any other status you use for returned orders
//     await order.save();

//     sendResponse(res, 200, 'Return processed successfully', null);
//   } catch (error) {
//     console.error('Error processing return:', error.message);
//     sendResponse(res, 500, error.message, null);
//   }
// });



router.get('/orders', async (req, res) => {
  try {
    const userId = req.user._id; 
    const userStatus = req.user.status;

    let orders;
    if (userStatus === 'Admin') {
      orders = await Order.find(); 
    } else {
      orders = await Order.find({ userId }); 
    }

    if (!orders.length) return sendResponse(res, 400, 'ยังไม่มีรายการขาย');

    sendResponse(res, 200, 'รายการขาย', orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    sendResponse(res, 500, error.message);
  }
});



router.post('/orders', async (req, res) => {
  try {
    const cartItems = req.body.cart;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return sendResponse(res, 400, 'ตะกร้าว่างหรือข้อมูลไม่ถูกต้อง', null);
    }

    const billId = new Date().toISOString().slice(0, -5) ;

    for (const item of cartItems) {
      const product = await Product.findById(item._id);
      if (!product) {
        return sendResponse(res, 400, `ไม่พบสินค้าหมายเลข ${item._id}`, null);
      }

      if (product.stock < item.quantity) {
        return sendResponse(res, 400, `สินค้าหมายเลข ${item._id} คงเหลือไม่พอ`, null);
      }

      const order = new Order({
        billId, 
        productId: item._id,
        quantity: item.quantity,
      });

      await order.save();

      product.stock -= item.quantity;
      await product.save();
    }

    sendResponse(res, 201, 'ขายสินค้าเรียบร้อยแล้ว', null);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดขณะขายสินค้า:', error); 
    sendResponse(res, 500, error.message, null);
  }
});

router.get(':billId/return', (req, res) => {
  console.log('Request URL:', req.url);
  console.log('Request Params:', req.params);
  res.send('Check the console for the request details');
});
// router.post(':billId/return', async (req, res) => {
//   try {
//     const billId = decodeURIComponent(req.params.billId);
//     console.log('billId:', billId); // ดูว่าได้ค่าอะไร

//     const order = await Order.findOne({ _id: billId });
    
//     if (!order) {
//       return res.status(400).json({ message: 'ไม่พบคำสั่งซื้อที่ระบุ' });
//     }

//     for (const item of order.products) {  
//       const product = await Product.findById(item.productId);
//       if (product) {
//         product.stock += item.quantity; 
//         await product.save();
//       }
//     }

//     order.status = 'returned';
//     await order.save();

//     res.status(200).json({ message: `คืนสินค้าสำหรับคำสั่งซื้อ ${billId} เรียบร้อยแล้ว` });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

module.exports = router;
