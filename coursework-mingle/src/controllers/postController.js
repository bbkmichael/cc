const Joi = require('joi');
const Post = require('../models/post');

const postSchema = Joi.object({
  title:     Joi.string().required(),
  topic:     Joi.array().items(Joi.string().valid('Politics', 'Health', 'Sport', 'Tech')).min(1).required(),
  message:   Joi.string().required(),
  expiresAt: Joi.date().iso().required()
});

// handle new post
exports.createPost = async (req, res) => {
  const { error } = postSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const post = new Post({
      title: req.body.title,
      topic: req.body.topic,
      message: req.body.message,
      ownerName: req.user.username,
      ownerId: req.user.id,
      expiresAt: req.body.expiresAt
    });

    post.updateStatus();
    await post.save();

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'could not create post', details: err.message });
  }
};

// list live posts
exports.getByTopic = async (req, res) => {
  const topic = req.params.topic;

  try {
    const now = new Date();
    const posts = await Post.find({
      topic,
      expiresAt: { $gt: now },
      status: 'Live'
    }).sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'could not fetch posts', details: err.message });
  }
};

// like single post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'post not found' });

    post.updateStatus();
    if (post.status === 'Expired') {
      return res.status(400).json({ error: 'post already expired' });
    }

    post.likes += 1;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'could not like post', details: err.message });
  }
};

// dislike single post
exports.dislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'post not found' });

    post.updateStatus();
    if (post.status === 'Expired') {
      return res.status(400).json({ error: 'post already expired' });
    }

    post.dislikes += 1;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'could not dislike post', details: err.message });
  }
};

const commentSchema = Joi.object({
  comment: Joi.string().required()
});

// add post comment
exports.addComment = async (req, res) => {
  const { error } = commentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'post not found' });

    post.updateStatus();
    if (post.status === 'Expired') {
      return res.status(400).json({ error: 'post already expired' });
    }

    post.comments.push({
      userId: req.user.id,
      username: req.user.username,
      comment: req.body.comment
    });

    await post.save();

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'could not add comment', details: err.message });
  }
};

// most active post
exports.mostActiveByTopic = async (req, res) => {
  const topic = req.params.topic;

  try {
    const post = await Post.find({
      topic,
      status: 'Live'
    }).sort({ likes: -1, dislikes: -1 }).limit(1);

    res.json(post[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'could not fetch most active', details: err.message });
  }
};

// lapsed  posts history
exports.historyByTopic = async (req, res) => {
  const topic = req.params.topic;

  try {
    const now = new Date();
    const posts = await Post.find({
      topic,
      $or: [
        { status: 'Expired' },
        { expiresAt: { $lte: now } }
      ]
    }).sort({ expiresAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'could not access history', details: err.message });
  }
};

