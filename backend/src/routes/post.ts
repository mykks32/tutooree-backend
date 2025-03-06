import express from 'express';
import { 
  createTuitionPost, 
  getAllTuitionPosts, 
  getTuitionPostById, 
  updateTuitionPost, 
  deleteTuitionPost 
} from '@controllers/post';
import { ensureAuthenticated } from '@middlewares/auth';


const router = express.Router();

// Apply auth middleware to routes that require authentication
router.post('/', ensureAuthenticated, createTuitionPost);
router.get('/', getAllTuitionPosts); 
router.get('/:id', getTuitionPostById);
router.patch('/:id', ensureAuthenticated, updateTuitionPost);
router.delete('/:id', ensureAuthenticated, deleteTuitionPost);

export default router;