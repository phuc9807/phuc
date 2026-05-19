const express = require('express')
const router = express.Router()
const Address = require('../models/Address')

router.get('/:user_id', async (req, res) => {
  const address = await Address.findOne({ user_id: Number(req.params.user_id) })
  res.json(address)
})

router.post('/', async (req, res) => {
  const { user_id, receiver_name, phone, address_detail } = req.body
  const address_id = Math.floor(Math.random() * 900000) + 100000
  const address = await Address.create({ address_id, user_id, receiver_name, phone, address_detail })
  res.status(201).json(address)
})

router.put('/:address_id', async (req, res) => {
  const address = await Address.findOneAndUpdate(
    { address_id: Number(req.params.address_id) },
    req.body,
    { new: true }
  )
  res.json(address)
})

module.exports = router