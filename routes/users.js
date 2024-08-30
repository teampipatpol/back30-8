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

router.put('/:id', async function (req, res) {
  const { id } = req.params;
  const { name, password } = req.body;

  // Validate name and password
  if (!name || !password) return sendResponse(res, 400, 'ตรวจไม่พบผู้ใช้');

  try {
    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    let updateData = { name, password: hashedPassword };

    // Uncomment this block if you have file upload functionality
    // if (req.file) {
    //   updateData.profileImage = req.file.path;
    // }

    // Update the user data in the database
    let result = await userSchema.findByIdAndUpdate(id, updateData, { new: true });

    // Check if the user was found and updated
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

router.post('/login', async function (req, res) {
  const { name, password } = req.body;
  console.log('Request body:', req.body); 

  if (!name || !password) return sendResponse(res, 400, 'ไม่พบข้อมูล');

  try {
    let user = await userSchema.findOne({ name });
    if (!user) return sendResponse(res, 401, 'ชื่อผู้ใช้ไม่ถูกต้อง');

    if (user.status !== 'approved' && user.status !== 'Admin') {
      return sendResponse(res, 401, 'บัญชีผู้ใช้ยังไม่ได้รับการอนุมัติจากแอดมิน', []);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendResponse(res, 401, 'รหัสผ่านไม่ถูกต้อง');

    const token = jwt.sign({ id: user._id, name: user.name, role: user.status }, "123456", { expiresIn: '1h' });
    sendResponse(res, 200, 'เข้าสู่ระบบสำเร็จ', { token, user: { name: user.name ,status:user.status} });

  } catch (error) {
    console.error(error);
    sendResponse(res, 500, 'Error');
  }
});
router.get('/approved-users', async function(req, res) {
  try {
    console.log("Fetching approved and Admin users");
    let users = await userSchema.find({ 
      $or: [ { status: 'approved' }, { status: 'Admin' } ]
    });
    console.log("Users found:", users); // Log the result

    sendResponse(res, 200, 'success', users);
  } catch (error) {
    console.error("Error fetching users:", error); 
    sendResponse(res, 500, 'Error');
  }
});
router.get('/getapp',async function(req,res) {
try{
  let users = await userSchema.find({
    $or: [ { status: 'approved' }, { status: 'Admin' } ]

  })
  console.log(users)
}  catch(error){
  sendResponse(res,500,'error',users)
}
});

module.exports = router;
