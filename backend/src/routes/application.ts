import { Router } from 'express';
import { ensureAuthenticated } from '../middlewares/auth';
import { 
  createTuitionApplication, 
  getTuitionApplications, 
  getMyApplications, 
  updateApplicationStatus 
} from '@controllers/application';

const router = Router();

// Create a new application
router.post('/:tuitionPostId', ensureAuthenticated, createTuitionApplication);

// Get applications for a specific tuition post (for post owners)
router.get('/post/:postId', ensureAuthenticated, getTuitionApplications);

// Get applications created by the current user
router.get('/my-applications', ensureAuthenticated, getMyApplications);

// Update application status (accept/reject)
router.patch('/:applicationId/status', ensureAuthenticated, updateApplicationStatus);

export default router;