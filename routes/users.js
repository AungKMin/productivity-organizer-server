import express from 'express';

// user controller functions
import { signin, signup } from '../controllers/users.js';

const router = express.Router();

router.post('/signin', signin);
router.post('/signup', signup);

export default router;

