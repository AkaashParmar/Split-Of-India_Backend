const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['Travel & Lifestyle', 'Tips & Tricks', 'Health & Wellness', 'General'],
    required: true,
  },
}, {
  timestamps: true
});


const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;

