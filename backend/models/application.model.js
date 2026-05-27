const { pool } = require('../config/db');

const ApplicationModel = {

  async findByUser(userId) {
    const [rows] = await pool.query(
      `SELECT
         a.id, a.stage, a.match_score, a.notes, a.cover_letter,
         a.applied_at, a.interview_date, a.offer_amount,
         a.created_at, a.updated_at,
         i.id AS internship_id, i.title, i.location, i.work_type,
         i.stipend_min, i.stipend_max, i.application_deadline,
         c.name AS company_name, c.logo_url
       FROM applications a
       JOIN internships i ON i.id = a.internship_id
       JOIN companies   c ON c.id = i.company_id
       WHERE a.user_id = ?
       ORDER BY a.updated_at DESC`,
      [userId]
    );
    return rows;
  },

  async findOne(id, userId) {
    const [[row]] = await pool.query(
      `SELECT a.*, i.title, i.location, i.work_type, c.name AS company_name
       FROM applications a
       JOIN internships i ON i.id = a.internship_id
       JOIN companies   c ON c.id = i.company_id
       WHERE a.id = ? AND a.user_id = ? LIMIT 1`,
      [id, userId]
    );
    return row || null;
  },

  async exists(userId, internshipId) {
    const [[{ cnt }]] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM applications WHERE user_id = ? AND internship_id = ?',
      [userId, internshipId]
    );
    return cnt > 0;
  },

  async create({ user_id, internship_id, match_score, notes, cover_letter }) {
    const [result] = await pool.query(
      `INSERT INTO applications (user_id, internship_id, match_score, notes, cover_letter)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, internship_id, match_score || null, notes || null, cover_letter || null]
    );
    return result.insertId;
  },

  async update(id, userId, fields) {
    const allowed = ['stage', 'notes', 'cover_letter', 'interview_date', 'offer_amount'];
    const updates = [];
    const values  = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }

    if (fields.stage === 'applied') {
      updates.push('applied_at = IFNULL(applied_at, NOW())');
    }

    if (updates.length === 0) return false;

    values.push(id, userId);
    const [result] = await pool.query(
      `UPDATE applications SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async delete(id, userId) { //withdraw application
    const [result] = await pool.query(
      'DELETE FROM applications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  async countByStage(userId) {
    const [rows] = await pool.query(
      `SELECT stage, COUNT(*) AS count
       FROM applications WHERE user_id = ?
       GROUP BY stage`,
      [userId]
    );
    return rows;
  },

  async countByWeek(userId, weeks = 8) {
    const [rows] = await pool.query(
      `SELECT
         YEARWEEK(created_at, 1) AS yw,
         MIN(DATE(created_at))   AS week_start,
         COUNT(*)                AS count
       FROM applications
       WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? WEEK)
       GROUP BY yw
       ORDER BY yw`,
      [userId, weeks]
    );
    return rows;
  },

  async avgScoreByStage(userId) { //match score
    const [rows] = await pool.query(
      `SELECT stage, ROUND(AVG(match_score), 1) AS avg_score, COUNT(*) AS count
       FROM applications
       WHERE user_id = ? AND match_score IS NOT NULL
       GROUP BY stage`,
      [userId]
    );
    return rows;
  },

  async recent(userId, limit = 5) { //recent applications 
    const [rows] = await pool.query(
      `SELECT a.id, a.stage, a.match_score, a.created_at,
              i.title, c.name AS company_name, c.logo_url
       FROM applications a
       JOIN internships i ON i.id = a.internship_id
       JOIN companies   c ON c.id = i.company_id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [userId, limit]
    );
    return rows;
  },
};

module.exports = ApplicationModel;
