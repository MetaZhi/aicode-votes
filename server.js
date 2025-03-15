const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 连接MongoDB数据库
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/streamer-suggestions';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB连接成功'))
.catch(err => console.error('MongoDB连接失败:', err));

// 定义建议模型
const SuggestionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Suggestion = mongoose.model('Suggestion', SuggestionSchema);

// 导入用户模型
const User = require('./models/User');

// API路由
// 获取所有建议
app.get('/api/suggestions', async (req, res) => {
  try {
    const suggestions = await Suggestion.find().sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: '获取建议失败', error: err.message });
  }
});

// 添加新建议
app.post('/api/suggestions', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: '建议内容不能为空' });
    }
    
    // 获取用户IP地址
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // 查找或创建用户
    let user = await User.findOne({ ipAddress });
    if (!user) {
      user = new User({ ipAddress });
    }
    
    // 检查用户是否可以提交建议
    if (!user.canSubmitSuggestion()) {
      return res.status(403).json({ message: '您今天已经提交过建议，请明天再来' });
    }
    
    // 更新用户的建议提交记录
    user.dailySuggestionCount += 1;
    user.lastSuggestionDate = new Date();
    await user.save();
    
    const newSuggestion = new Suggestion({ content });
    const savedSuggestion = await newSuggestion.save();
    res.status(201).json(savedSuggestion);
  } catch (err) {
    res.status(500).json({ message: '添加建议失败', error: err.message });
  }
});

// 给建议点赞
app.put('/api/suggestions/:id/upvote', async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ message: '建议不存在' });
    }
    
    // 获取用户IP地址
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // 查找或创建用户
    let user = await User.findOne({ ipAddress });
    if (!user) {
      user = new User({ ipAddress });
    }
    
    // 检查用户是否可以点赞
    if (!user.canUpvote(suggestion._id)) {
      return res.status(403).json({ 
        message: user.dailyUpvotes.includes(suggestion._id.toString()) 
          ? '您已经给这个建议点过赞了' 
          : '您今天的点赞次数已达上限（5次），请明天再来' 
      });
    }
    
    // 更新用户的点赞记录
    user.dailyUpvotes.push(suggestion._id.toString());
    user.lastActionDate = new Date();
    await user.save();
    
    suggestion.upvotes += 1;
    await suggestion.save();
    res.json(suggestion);
  } catch (err) {
    res.status(500).json({ message: '点赞失败', error: err.message });
  }
});

// 给建议点踩
app.put('/api/suggestions/:id/downvote', async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ message: '建议不存在' });
    }
    
    // 获取用户IP地址
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // 查找或创建用户
    let user = await User.findOne({ ipAddress });
    if (!user) {
      user = new User({ ipAddress });
    }
    
    // 检查用户是否可以点踩
    if (!user.canDownvote(suggestion._id)) {
      return res.status(403).json({ 
        message: user.dailyDownvotes.includes(suggestion._id.toString()) 
          ? '您已经给这个建议点过踩了' 
          : '您今天的点踩次数已达上限（5次），请明天再来' 
      });
    }
    
    // 更新用户的点踩记录
    user.dailyDownvotes.push(suggestion._id.toString());
    user.lastActionDate = new Date();
    await user.save();
    
    suggestion.downvotes += 1;
    await suggestion.save();
    res.json(suggestion);
  } catch (err) {
    res.status(500).json({ message: '点踩失败', error: err.message });
  }
});

// 生产环境下提供静态文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`服务器运行在端口 ${PORT}`));