const Blog = require('../models/BlogsModel');

// @desc    Create a new blog (Admin only)
exports.createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

        const blog = await Blog.create({
            title,
            content,
            image: imagePath,
            author: req.user._id
        });
        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'name email');
    const BASE_URL = `${req.protocol}://${req.get('host')}`;

    const blogsWithFullImage = blogs.map((blog) => ({
      ...blog._doc,
      image: blog.image ? `${BASE_URL}${blog.image}` : '',
    }));

    res.json(blogsWithFullImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name email');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const BASE_URL = `${req.protocol}://${req.get('host')}`;
    const blogWithFullImage = {
      ...blog._doc,
      image: blog.image ? `${BASE_URL}${blog.image}` : '',
    };

    res.json(blogWithFullImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update blog (Admin only)
exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        blog.title = req.body.title || blog.title;
        blog.content = req.body.content || blog.content;
        blog.image = req.file?.path || blog.image;

        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete blog (Admin only)
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
