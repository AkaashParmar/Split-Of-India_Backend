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
const addressRoutes = require('./routes/addressRoutes.js')
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const googleAuthRoutes = require('./routes/authRoutes'); 
const User = require('./models/GoogleUser');
const bodyParser = require('body-parser');
const jobRoutes = require('./routes/jobApplicationRoutes');
const paymentRoutes = require('./routes/paymentRoutes.js')
const Razorpay = require('razorpay');
const { protect } = require("../src/middlewares/authMiddleware.js");
const Order = require('./models/paymentModel.js');

dotenv.config();
console.log("EMAIL_USER:", process.env.EMAIL_USER); 
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://spirit-of-india.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Passport & Session Setup ---
app.use(session({
  secret: process.env.JWT_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName,
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

app.get('/api/running', (req, res) => {
    res.json({ message: 'Server is running' });
}); 
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', googleAuthRoutes); 
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
app.use('/api/addresses', addressRoutes);
app.use('/api/deals', productRoutes); 
app.use('/api/suggest-product', suggestionRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/jobs', jobRoutes);
// To serve uploaded images
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// get Razorpay key (for frontend to access)
app.get("/get-razorpay-key", (req, res) => {
  try {
    console.log("Razorpay Keys fetched successfully");
    res.status(200).json({
      key: process.env.RAZORPAY_KEY_ID,
      secret: process.env.RAZORPAY_KEY_SECRET, // Optional, don’t expose in frontend
    });
  } catch (error) {
    console.error("Error fetching Razorpay keys:", error);
    res.status(500).json({ message: "Failed to fetch keys", error: error.message });
  }
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post("/create-order", async (req, res) => {
  console.log("Create order");
  console.log("body", req.body);

  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required to create order",
      });
    }

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7), // random ID
    };

    const order = await razorpay.orders.create(options);
    console.log("Order created successfully:", order);

    res.status(200).json(order);
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    res.status(500).json({ error: "Something went wrong while creating Razorpay order" });
  }
});


app.post("/order", protect, async (req, res) => {
  try {
    console.log("Incoming Order Payload:", req.body); // ✅ Already logging

    const order = new Order({
      user: req.user._id,
      orderItems: req.body.items,
      totalAmount: req.body.totalAmount,
      totalPrice: req.body.totalPrice,
      shippingAddress: req.body.shippingAddress,
      paymentInfo: req.body.paymentInfo,
    });

    console.log("totalPrice:", req.body.totalPrice);
    console.log("shippingAddress:", req.body.shippingAddress);

    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Error placing order:", error);
    res
      .status(500)
      .json({ message: "Error placing order", error: error.message });
  }
});

app.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("orderItems.product");
    console.log("Fetched Orders:", orders); // ✅
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err); // ✅
    res.status(500).json({ message: err.message });
  }
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

app.use((err, req, res, next) => {
    // Global error handler
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});




// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

