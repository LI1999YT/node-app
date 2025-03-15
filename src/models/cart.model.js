const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    selected: {
      type: Boolean,
      default: true
    }
  }],
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 更新购物车总金额
cartSchema.methods.updateTotalAmount = async function() {
  await this.populate('items.product');
  let total = 0;
  for (const item of this.items) {
    if (item.selected && item.product) {
      total += item.product.price * item.quantity;
    }
  }
  this.totalAmount = total;
  await this.save();
};

module.exports = mongoose.model('Cart', cartSchema); 