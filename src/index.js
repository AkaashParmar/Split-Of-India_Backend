const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db/db.js');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const categoryRoutes = require('./routes/categoryRoutes.js');
const morgan = require("morgan");

dotenv.config();
console.log("EMAIL_USER:", process.env.EMAIL_USER); // ✅ Debug
connectDB();

const app = express();

app.use(morgan("dev"));

// Middleware
app.use(cors());
app.use(express.json()); // To accept JSON data

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories',categoryRoutes);


// Error Middleware
app.use(notFound);
app.use(errorHandler);



// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

