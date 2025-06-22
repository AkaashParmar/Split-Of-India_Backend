const Blog = require("../models/BlogsModel");
const fs = require("fs");
const slugify = require("slugify");
const cloudinary = require("../config/cloudinary-config");

//Create a new blog (Admin only)
exports.createBlog = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res
        .status(400)
        .json({ message: "Title, content, and category are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Blog image is required" });
    }

    const localImagePath = req.file.path;

    const resultCloud = await cloudinary.uploader.upload(localImagePath, {
      folder: "blogs",
    });

    fs.unlinkSync(localImagePath); // Clean up local file after upload

    const blog = await Blog.create({
      title,
      content,
      image: resultCloud.secure_url,
      author: req.user._id,
      category,
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Get all blogs (with optional category filter)
exports.getAllBlogs = async (req, res) => {
  try {
    const category = req.query.category;

    // If category is specified and not "All", filter by category
    const filter = category && category !== "All" ? { category } : {};

    const blogs = await Blog.find(filter)
      .populate("author", "name email")
      .sort({ createdAt: -1 }); // Optional: show latest first

    const BASE_URL = `${req.protocol}://${req.get("host")}`;

    const blogsWithFullImage = blogs.map((blog) => {
      const image = blog.image && blog.image.startsWith("http")
        ? blog.image
        : `${BASE_URL}${blog.image}`;

      return {
        ...blog._doc,
        image,
      };
    });

    res.status(200).json(blogsWithFullImage);
  } catch (error) {
    console.error("Get blogs error:", error);
    res.status(500).json({ message: error.message });
  }
};


//Get a single blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name email"
    );
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const BASE_URL = `${req.protocol}://${req.get("host")}`;
    const blogWithFullImage = {
      ...blog._doc,
      image: blog.image ? `${BASE_URL}${blog.image}` : "",
    };

    res.json(blogWithFullImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Update blog (Admin only)
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;

    // If a new image was uploaded
    if (req.file) {
      const localImagePath = req.file.path;

      // Upload new image to Cloudinary
      const resultCloud = await cloudinary.uploader.upload(localImagePath, {
        folder: "blogs",
      });

      // Clean up local temp file
      fs.unlinkSync(localImagePath);

      // Update image URL in blog
      blog.image = resultCloud.secure_url;
    }

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ message: error.message });
  }
};

//Delete blog (Admin only)
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
