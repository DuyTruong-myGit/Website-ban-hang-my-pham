import express from 'express';
import {
  getProductQuestions,
  askQuestion,
  answerQuestion,
  getPendingQuestions,
  getAllQuestions
} from '../controllers/questionController.js';
import { protect, adminOrStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/product/:productId', getProductQuestions);
router.post('/', protect, askQuestion);

const staffRouter = express.Router();
staffRouter.get('/', protect, adminOrStaff, getAllQuestions);
staffRouter.get('/pending', protect, adminOrStaff, getPendingQuestions);
staffRouter.put('/:id/answer', protect, adminOrStaff, answerQuestion);

export { router as default, staffRouter };
