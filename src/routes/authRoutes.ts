import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

// Protected routes
router.post('/logout', authenticate, authController.logout.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));

export default router; 