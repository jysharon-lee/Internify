const ApplicationModel = require('../models/application.model');
const InternshipModel  = require('../models/internship.model');
const UserModel        = require('../models/user.model');
const { computeMatchScore } = require('../services/matching.service');
const { createError }  = require('../middleware/error.middleware');

exports.list = async (req, res, next) => {
  try {
    const applications = await ApplicationModel.findByUser(req.user.id);

    const grouped = {
      saved:     [],
      applied:   [],
      interview: [],
      offer:     [],
      rejected:  [],
    };

    for (const app of applications) {
      if (grouped[app.stage]) grouped[app.stage].push(app);
    }

    res.json({ success: true, data: grouped });
  } catch (err) {
    next(err);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const app = await ApplicationModel.findOne(req.params.id, req.user.id);
    if (!app) throw createError(404, 'Application not found.');

    res.json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
};

/**
 * Flow:
 *   1. Check if already applied
 *   2. Compute match score
 *   3. Create application with match score cached
 */
exports.create = async (req, res, next) => {
  try {
    const { internship_id, notes, cover_letter, stage } = req.body;

    if (!internship_id) throw createError(400, 'internship_id is required.');

    // check if already applied
    const exists = await ApplicationModel.exists(req.user.id, internship_id);
    if (exists) throw createError(409, 'You already have an application for this internship.');

    // get internship + user profile
    const [internship, user, userSkills] = await Promise.all([
      InternshipModel.findById(internship_id),
      UserModel.findById(req.user.id),
      UserModel.getSkills(req.user.id),
    ]);

    if (!internship) throw createError(404, 'Internship not found.');

    // compute match score
    const userWithSkills = { ...user, skills: userSkills };
    const match = computeMatchScore(userWithSkills, internship);

    // create application with cached score (stage defaults to 'saved' in model)
    const appId = await ApplicationModel.create({
      user_id:       req.user.id,
      internship_id,
      match_score:   match.score,
      notes:         notes || null,
      cover_letter:  cover_letter || null,
      stage:         stage || undefined,
    });

    const app = await ApplicationModel.findOne(appId, req.user.id);
    res.status(201).json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
};

//use kanban board to update application stage
exports.update = async (req, res, next) => {
  try {
    const appId = req.params.id;
    const updated = await ApplicationModel.update(appId, req.user.id, req.body);

    if (!updated) throw createError(404, 'Application not found or unauthorized.');

    const app = await ApplicationModel.findOne(appId, req.user.id);
    res.json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
};

//delete application
exports.delete = async (req, res, next) => {
  try {
    const deleted = await ApplicationModel.delete(req.params.id, req.user.id);
    if (!deleted) throw createError(404, 'Application not found or unauthorized.');

    res.json({ success: true, message: 'Application deleted.' });
  } catch (err) {
    next(err);
  }
};
