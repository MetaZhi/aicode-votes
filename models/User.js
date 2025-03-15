const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    unique: true
  },
  dailySuggestionCount: {
    type: Number,
    default: 0
  },
  lastSuggestionDate: {
    type: Date,
    default: null
  },
  dailyUpvotes: {
    type: Array,
    default: []
  },
  dailyDownvotes: {
    type: Array,
    default: []
  },
  lastActionDate: {
    type: Date,
    default: Date.now
  }
});

// 检查用户今天是否可以提交建议
UserSchema.methods.canSubmitSuggestion = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 如果没有提交过建议或者最后提交日期不是今天
  if (!this.lastSuggestionDate || new Date(this.lastSuggestionDate).setHours(0, 0, 0, 0) < today.getTime()) {
    return true;
  }
  
  // 如果今天已经提交了建议，但数量小于1
  return this.dailySuggestionCount < 1;
};

// 检查用户今天是否可以给特定建议点赞
UserSchema.methods.canUpvote = function(suggestionId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 检查今天的操作日期
  if (new Date(this.lastActionDate).setHours(0, 0, 0, 0) < today.getTime()) {
    // 如果是新的一天，重置点赞和点踩记录
    this.dailyUpvotes = [];
    this.dailyDownvotes = [];
    this.lastActionDate = new Date();
  }
  
  // 检查是否已经点过赞
  if (this.dailyUpvotes.includes(suggestionId.toString())) {
    return false;
  }
  
  // 检查点赞次数是否达到上限
  return this.dailyUpvotes.length < 5;
};

// 检查用户今天是否可以给特定建议点踩
UserSchema.methods.canDownvote = function(suggestionId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 检查今天的操作日期
  if (new Date(this.lastActionDate).setHours(0, 0, 0, 0) < today.getTime()) {
    // 如果是新的一天，重置点赞和点踩记录
    this.dailyUpvotes = [];
    this.dailyDownvotes = [];
    this.lastActionDate = new Date();
  }
  
  // 检查是否已经点过踩
  if (this.dailyDownvotes.includes(suggestionId.toString())) {
    return false;
  }
  
  // 检查点踩次数是否达到上限
  return this.dailyDownvotes.length < 5;
};

module.exports = mongoose.model('User', UserSchema);