const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/postController');

const router = express.Router();

// create new post
router.post('/', auth, controller.createPost);

// like existing post
router.post('/:id/like', auth, controller.likePost);

// dislike existing post
router.post('/:id/dislike', auth, controller.dislikePost);

// comment on post
router.post('/:id/comment', auth, controller.addComment);

// list live by topic
router.get('/topic/:topic', controller.getByTopic);

// top active by topic
router.get('/most-active/:topic', controller.mostActiveByTopic);

// expired history topic
router.get('/history/:topic', controller.historyByTopic);

module.exports = router;
