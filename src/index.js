const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db/db.js');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes.js');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const categoryRoutes = require('./routes/categoryRoutes.js');
const morgan = require("morgan");
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/OrderRoutes');
const blogRoutes = require('./routes/BlogRoutes');
const path = require('path');
const couponRoutes = require('./routes/CouponRoutes');
const contactRoutes = require('./routes/contactRoutes');
const regionRoutes = require('./routes/regionRoutes.js');
const stateRoutes = require('./routes/stateRoutes.js');
const suggestionRoutes = require('./routes/suggestionRoutes');

dotenv.config();

const bodyParser = require('body-parser');


console.log("EMAIL_USER:", process.env.EMAIL_USER); 
connectDB();

const app = express();
app.use(morgan("dev"));


// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/running', (req, res) => {
    res.json({ message: 'Server is running' });
}); 


// Routes
app.use('/api/coupons', couponRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories',categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/contact', contactRoutes);


// To serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/suggest-product', suggestionRoutes);



app.use((err, req, res, next) => {
    // Global error handler
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

