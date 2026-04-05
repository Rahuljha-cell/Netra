import { Router } from 'express';
import { sendOtp, verifyOtp, getMe } from '../controllers/auth.controller';
import { auth } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validateSendOtp, validateVerifyOtp } from '../middleware/validation';

const router = Router();

router.post('/send-otp', authRateLimiter, validateSendOtp, sendOtp);
router.post('/verify-otp', authRateLimiter, validateVerifyOtp, verifyOtp);
router.get('/me', auth, getMe);

export default router;
