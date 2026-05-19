const Product = require('../models/Product');
const slugify = require('slugify');

// Lấy tất cả sản phẩm
const getProducts = async (req, res) => {
  const { category_id, search, sale } = req.query;
  let filter = {};
  if (category_id) filter.category_id = Number(category_id);
  if (search) filter.product_name = { $regex: search, $options: 'i' };
  if (sale === 'true') filter.on_sale = true;

  const products = await Product.find(filter);
  res.json(products);
};

// Lấy 1 sản phẩm theo slug
const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  res.json(product);
};

// Thêm sản phẩm
const createProduct = async (req, res) => {
  const { product_name, price, stock, description, image, category_id, on_sale, sale_price } = req.body;
  const product_id = Math.floor(Math.random() * 900000) + 100000;
  const slug = slugify(product_name, { lower: true, locale: 'vi' });

  const product = await Product.create({
    product_id, category_id, product_name,
    price, stock, description, image, slug,
    on_sale: on_sale || false,
    sale_price: on_sale ? sale_price : null,
  });
  res.status(201).json(product);
};

// Sửa sản phẩm
const updateProduct = async (req, res) => {
  const { on_sale, sale_price, ...rest } = req.body;
  const update = {
    ...rest,
    on_sale: on_sale || false,
    sale_price: on_sale ? sale_price : null,
  };
  const product = await Product.findOneAndUpdate(
    { product_id: Number(req.params.id) },
    update,
    { new: true }
  );
  res.json(product);
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  await Product.findOneAndDelete({ product_id: Number(req.params.id) });
  res.json({ message: 'Đã xóa sản phẩm' });
};

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct };