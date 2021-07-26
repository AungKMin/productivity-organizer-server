import express from 'express';

// import controller functions
import { getPost, getPosts, getPostsByUser, getPostsBySearch, getPostsBySearchAndUser, createPost, updatePost, deletePost, likePost, commentPost } from '../controllers/posts.js'; 
// import middleware
import auth from '../middleware/auth.js';

const router = express.Router();

// localhost:5000/posts
// router.get('/search', getPostsBySearch);
router.get('/search', auth, getPostsBySearchAndUser);
// router.get('/', getPosts);
router.get('/', auth, getPostsByUser);
// router.get('/userPosts', auth, getPostsByUser);
router.get('/:id', getPost);
router.post('/', auth, createPost);
router.patch('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.patch('/:id/likePost', auth, likePost);
router.post('/:id/commentPost', auth, commentPost);

export default router;