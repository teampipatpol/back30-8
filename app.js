// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');
// var cors = require('cors');
// require('dotenv').config();
// require('./db')
// const ordersRouter = require('./routes/orders');

// const productsRouter = require('./routes/products');

// var app = express();

// app.use(cors())

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));
// app.use('/public', express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/api/v1', usersRouter);
// app.use('/api/v1/orders', ordersRouter);
// app.use('/api/v1/products', productsRouter);

// // const productTypesRouter = require('./routes/producttypes');
// // app.use('/api/v1/producttypes', productTypesRouter);

// const salesRouter = require('./routes/sales');
// app.use('/api/v1/sales', salesRouter);

// app.use(express.json()); 

// app.use(function(req, res, next) {
//   next(createError(404));
// });

// app.use(function(err, req, res, next) {
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   res.status(err.status || 500);
//   res.render('error');
// });
// app.use(cors({
//   origin: 'https://mamha-86c4c.firebaseapp.com/', // เปลี่ยนเป็นโดเมนของ frontend
// }));

// module.exports = app;
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors'); // ย้ายขึ้นไปที่ส่วนบน

require('dotenv').config();
require('./db');

var indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');
const productsRouter = require('./routes/products');
const salesRouter = require('./routes/sales');

var app = express();

// ตั้งค่า CORS
app.use(cors({
  origin: 'https://mamha-86c4c.firebaseapp.com/', // เปลี่ยนเป็นโดเมนของ frontend
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1', usersRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/sales', salesRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
