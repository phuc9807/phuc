const mongoose = require('mongoose')
const slugify = require('slugify')
require('dotenv').config()

const Product = require('../models/Product')

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected!')

  const products = await Product.find({ slug: { $exists: false } })
  console.log(`Tìm thấy ${products.length} sản phẩm chưa có slug`)

  for (const p of products) {
    p.slug = slugify(p.product_name, { lower: true, locale: 'vi' })
    await p.save()
    console.log(`✅ ${p.product_name} → ${p.slug}`)
  }

  console.log('Xong!')
  process.exit(0)
}

run()