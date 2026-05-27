const express = require('express');
const { body, query } = require('express-validator');
const multer = require('multer');
const path = require('path');

const { authenticate } = require('../middleware/auth.middleware');
const authCtrl = require('../controllers/auth.controller');
const userCtrl = require('../controllers/user.controller');
const internshipCtrl = require('../controllers/internship.controller');
const applicationCtrl = require('../controllers/application.controller');
const analyticsCtrl = require('../controllers/analytics.controller');

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|doc|docx)$/i;
    if (allowed.test(file.originalname)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX files allowed'));
  },
});

// auth

 // POST /api/auth/register

router.post('/auth/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').trim().notEmpty(),
  authCtrl.register
);


 //POST /api/auth/login

router.post('/auth/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  authCtrl.login
);


// All routes below require valid JWT
router.use(authenticate);

//Auth 

 //GET /api/auth/me
 // Returns current user profile

router.get('/auth/me', authCtrl.me);

//  User Profile 

 // GET /api/user/profile
 // Returns full user profile with skills

router.get('/user/profile', userCtrl.getProfile);

 // PUT /api/user/profile
 // Update profile fields

router.put('/user/profile',
  body('years_experience').optional().isInt({ min: 0, max: 10 }),
  body('expected_salary').optional().isInt({ min: 0 }),
  body('onboarding_step').optional().isInt({ min: 0, max: 4 }),
  body('onboarding_complete').optional().isBoolean(),
  userCtrl.updateProfile
);

 // PUT /api/user/skills
 // Replace all user skills

router.put('/user/skills',
  body('skills').isArray(),
  userCtrl.updateSkills
);

 //POST /api/user/resume
 // Upload resume file

router.post('/user/resume',
  upload.single('resume'),
  userCtrl.uploadResume
);

//Internships 


 // GET /api/internships
 //List all internships with match scores

router.get('/internships',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  internshipCtrl.list
);

 // GET /api/internships/skills
 // Get master skill list

router.get('/internships/skills', internshipCtrl.skills);

 // GET /api/internships/:id
 // Get single internship detail with match breakdown

router.get('/internships/:id', internshipCtrl.detail);

// Applications 

 //GET /api/applications
 //List all user applications grouped by stage
 
router.get('/applications', applicationCtrl.list);

//POST /api/applications
//Create new application (save internship)
router.post('/applications',
  body('internship_id').isInt(),
  applicationCtrl.create
);

//GET /api/applications/:id
//Get single application detail

router.get('/applications/:id', applicationCtrl.detail);

 //PUT /api/applications/:id
 //Update application (drag-drop stages, add notes, set interview date, etc)
router.put('/applications/:id',
  body('stage').optional().isIn(['saved', 'applied', 'interview', 'offer', 'rejected']),
  body('interview_date').optional().isISO8601(),
  body('offer_amount').optional().isInt({ min: 0 }),
  applicationCtrl.update
);

router.delete('/applications/:id', applicationCtrl.delete);

//GET /api/analytics/summary

router.get('/analytics/summary', analyticsCtrl.summary);


 //GET /api/analytics/applications-per-week
router.get('/analytics/applications-per-week',
  query('weeks').optional().isInt({ min: 1, max: 52 }),
  analyticsCtrl.applicationsPerWeek
);

 //avg match score by stage 
router.get('/analytics/score-distribution', analyticsCtrl.scoreDistribution);

 //Comprehensive report 
router.get('/analytics/full-report', analyticsCtrl.fullReport);


module.exports = router;
