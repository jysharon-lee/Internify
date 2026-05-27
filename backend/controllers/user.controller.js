const path    = require('path');
const UserModel = require('../models/user.model');
const { createError } = require('../middleware/error.middleware');

exports.getProfile = async (req, res, next) => {
  try {
    const user   = await UserModel.findById(req.user.id);
    if (!user) throw createError(404, 'User not found.');

    const skills = await UserModel.getSkills(req.user.id);
    res.json({ success: true, user: { ...user, skills } });
  } catch (err) {
    next(err);
  }
};

 //Accepts any subset of profile fields as JSON body
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = [
      'full_name', 'headline', 'bio', 'location', 'phone',
      'years_experience', 'preferred_role', 'preferred_location',
      'preferred_type', 'expected_salary',
      'onboarding_step', 'onboarding_complete',
    ];

    const fields = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) fields[key] = req.body[key];
    }

    await UserModel.updateProfile(req.user.id, fields);
    const user   = await UserModel.findById(req.user.id);
    const skills = await UserModel.getSkills(req.user.id);

    res.json({ success: true, user: { ...user, skills } });
  } catch (err) {
    next(err);
  }
};

exports.updateSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) throw createError(400, 'skills must be an array.');

    await UserModel.setSkills(req.user.id, skills);
    const updatedSkills = await UserModel.getSkills(req.user.id);

    res.json({ success: true, skills: updatedSkills });
  } catch (err) {
    next(err);
  }
};

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) throw createError(400, 'No file uploaded.');

    const resumeUrl = `/uploads/${req.file.filename}`;

    // simulate resume parsing 
    const simulatedParsed = _simulateResumeParse(req.file.originalname);

    await UserModel.updateProfile(req.user.id, {
      resume_url:          resumeUrl,
      resume_parsed_text:  simulatedParsed,
    });

    res.json({
      success:       true,
      resume_url:    resumeUrl,
      parsed_text:   simulatedParsed,
      message:       'Resume uploaded successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// private helpers 

function _simulateResumeParse(filename) {
  return `[SIMULATED PARSE] Resume file: ${filename}\n` +
    `Extracted sections: Education, Work Experience, Skills, Projects.\n` +
    `Skills detected: JavaScript, Vue.js, Node.js, MySQL, Git.\n` +
    `Education: Bachelor of Computer Science (in progress).\n` +
    `This is a simulation. In production, integrate with a PDF parsing service.`;
}
