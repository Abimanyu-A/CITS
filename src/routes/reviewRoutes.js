import express from 'express';
import {
  createPerformanceReview,
  getPerformanceReview,
  getAllPerformanceReviews,
  updatePerformanceReview,
  deletePerformanceReview,
  getEmployeeReviews,
  getReviewHistory,
} from '../controllers/performanceReviewController.js';

const reviewRouter = express.Router();

reviewRouter.post('/', createPerformanceReview);
reviewRouter.get('/', getAllPerformanceReviews);
reviewRouter.get('/:reviewId', getPerformanceReview);
reviewRouter.put('/:reviewId', updatePerformanceReview);
reviewRouter.delete('/:reviewId', deletePerformanceReview);
reviewRouter.get('/employee/:employeeId', getEmployeeReviews);
reviewRouter.get('/history/:reviewId', getReviewHistory);

export default reviewRouter;