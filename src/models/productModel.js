const mongoose = require('mongoose');
require('./categoryModel');
const productSchema = mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug:{type:String,required:true,unique:true,lowercase:true},
    image: { type: Array, },
    description: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref:'Category' },
    price: { type: Number, required: true },
    countInStock: { type: Number, min:0, max: 255, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    sold:{type:Number,default:0},
    ratings:{
        star:Number,
        postedby:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    }
   
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
