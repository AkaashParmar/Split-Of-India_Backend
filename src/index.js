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

dotenv.config();
console.log("EMAIL_USER:", process.env.EMAIL_USER); 
connectDB();

const app = express();



// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
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
app.use('/api/payment', paymentRoutes);
// To serve uploaded images
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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

