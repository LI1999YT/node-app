const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: String,
  phone: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  addresses: [{
    name: String,
    phone: String,
    province: String,
    city: String,
    district: String,
    address: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// 密码验证
userSchema.methods.comparePassword = async function(candidatePassword) {
  // 前端已经进行了MD5加密，直接比较加密后的密码
  return this.password === candidatePassword;
};

// 生成用户资料
userSchema.methods.toProfile = function() {
  return {
    id: this._id,
    email: this.email,
    username: this.username,
    phone: this.phone,
    avatar: this.avatar,
    isVerified: this.isVerified,
    role: this.role,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema); 