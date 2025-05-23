const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db/db.js');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const categoryRoutes = require('./routes/categoryRoutes.js');
const morgan = require("morgan");
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/OrderRoutes');
const blogRoutes = require('./routes/BlogRoutes');
const path = require('path');
const couponRoutes = require('./routes/CouponRoutes');


dotenv.config();
console.log("EMAIL_USER:", process.env.EMAIL_USER); // ✅ Debug
connectDB();

const app = express();

app.use(morgan("dev"));


// Middleware
app.use(cors());
app.use(express.json()); // To accept JSON data

//coupon
app.use('/api/coupons', couponRoutes);

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories',categoryRoutes);

//cart
app.use('/api/cart', cartRoutes);

//order
app.use('/api/orders', orderRoutes);

//Blogs
app.use('/api/blogs', blogRoutes);

// To serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));



// Error Middleware
app.use(notFound);
app.use(errorHandler);



// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

