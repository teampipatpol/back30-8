var express = require('express');
var router = express.Router();
const userSchema = require('../models/user');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authToken = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const sendResponse = (res, statusCode, message, data) => {
  res.status(statusCode).json({
    status: statusCode,
    message: message,
    data: data
  });
};

router.get('/', async function (req, res, ) {
  try {
    let users = await userSchema.find({});
    sendResponse(res, 200, 'success', users);
  } catch (error) {
    console.error(error); 
    sendResponse(res, 500, 'Error');
  }
});

router.post('/register', upload.single('profile'), async function (req, res, ) {
  const { name, password } = req.body;
  console.log(req.body); 
  if (!name || !password) return sendResponse(res, 400, 'ไม่พบข้อมูล');

  try {
    let existingUser = await userSchema.findOne({ name });
    
    if (existingUser) {
      return sendResponse(res, 400, 'มีผู้ใช้นี้อยู่แล้ว');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userSchema({
      name,
      password: hashedPassword,
      status: 'pending', 
    });

    await newUser.save();
    sendResponse(res, 201, "สมัครสมาชิกสำเร็จ. กรุณารอการอนุมัติจากแอดมิน.", newUser);
  } catch (error) {
    console.error(error); 
    sendResponse(res, 500, 'ไม่สามารถสมัครสมาชิกได้');
  }
});

router.put('/approve/:id', async function (req, res, ) {
  const { id } = req.params;

  try {
    let user = await userSchema.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
    if (!user) return sendResponse(res, 404, 'หาบัญชีไม่พบ');
    
    sendResponse(res, 200, 'บัญชีผู้ใช้ได้รับการอนุมัติเรียบร้อย', user);
  } catch (error) {
    console.error(error); 
    sendResponse(res, 500, 'Error', []);
  }
});

router.put('/:id', upload.single('profile'), async function (req, res, ) {
  const { id } = req.params;
  const { name, username } = req.body;

  if (!name || !username) return sendResponse(res, 400, 'ตรวจไม่พบผู้ใช้');

  try {
    let updateData = { name, username };
    if (req.file) {
      updateData.profileImage = req.file.path;
    }
    let result = await userSchema.findByIdAndUpdate(id, updateData, { new: true });
    if (result) {
      sendResponse(res, 200, 'อัพเดทสำเร็จ', result);
    } else {
      sendResponse(res, 404, 'หาบัญชีผู้ใช้ไม่เจอ');
    }
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, 'Error', []);
  }
});

router.delete('/:id', async function (req, res, ) {
  const { id } = req.params;

  try {
    let result = await userSchema.findByIdAndDelete(id);
    if (result) {
      sendResponse(res, 200, 'ลบข้อมูลเรียบร้อย', result);
    } else {
      sendResponse(res, 404, 'หาบัญชีผู้ใช้ไม่เจอ');
    }
  } catch (error) {
    console.error(error); 
    sendResponse(res, 500, 'Error', []);
  }
});

router.post('/login', async function (req, res, ) {
  const { name, password } = req.body;
  console.log('Request body:', req.body); 

  if (!name || !password) return sendResponse(res, 400, 'ไม่พบข้อมูล');

  try {
    let user = await userSchema.findOne({ name });
    if (!user) return sendResponse(res, 401, 'ชื่อผู้ใช้ไม่ถูกต้อง');

    if (user.status !== 'approved') return sendResponse(res, 401, 'บัญชีผู้ใช้ยังไม่ได้รับการอนุมัติจากแอดมิน', []);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendResponse(res, 401, 'รหัสผ่านไม่ถูกต้อง');

    const token = jwt.sign({ id: user._id, name: user.name }, "123456", { expiresIn: '1h' });
    sendResponse(res, 200, 'เข้าสู่ระบบสำเร็จ', { token });

  } catch (error) {
    console.error(error);
    sendResponse(res, 500, 'Error');
  }
});

module.exports = router;
