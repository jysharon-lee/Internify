const InternshipModel = require('../models/internship.model');
const UserModel       = require('../models/user.model');
const { rankInternships, computeMatchScore } = require('../services/matching.service');
const { createError } = require('../middleware/error.middleware');

//get API for internships
exports.list = async (req, res, next) => {
  try {
    const { search, work_type, location, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const filters = { search, work_type, location, limit, offset };

    // Fetch internships and user profile in parallel
    const [internships, user, userSkills, total] = await Promise.all([
      InternshipModel.findAll(filters),
      UserModel.findById(req.user.id),
      UserModel.getSkills(req.user.id),
      InternshipModel.count(filters),
    ]);

    const userWithSkills = { ...user, skills: userSkills };

    // attach match scores and sort
    const ranked = rankInternships(userWithSkills, internships);

    res.json({
      success: true,
      data:    ranked,
      meta: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

 //Returns full internship detail with match breakdown
exports.detail = async (req, res, next) => {
  try {
    const [internship, user, userSkills] = await Promise.all([
      InternshipModel.findById(req.params.id),
      UserModel.findById(req.user.id),
      UserModel.getSkills(req.user.id),
    ]);

    if (!internship) throw createError(404, 'Internship not found.');

    const userWithSkills = { ...user, skills: userSkills };
    const match = computeMatchScore(userWithSkills, internship);

    res.json({
      success: true,
      data:    { ...internship, match },
    });
  } catch (err) {
    next(err);
  }
};

//Returns master skill list for the tag selector
exports.skills = async (req, res, next) => {
  try {
    const skills = await InternshipModel.getAllSkills();
    res.json({ success: true, data: skills });
  } catch (err) {
    next(err);
  }
};
