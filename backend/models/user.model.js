const { pool } = require('../config/db');

const UserModel = { //find by email
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) { //find by id
    const [rows] = await pool.query(
      `SELECT id, email, full_name, avatar_url, headline, bio, location, phone,
              years_experience, preferred_role, preferred_location, preferred_type,
              expected_salary, resume_url, onboarding_step, onboarding_complete,
              last_login, created_at
       FROM users WHERE id = ? AND is_active = 1 LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ email, password_hash, full_name }) {
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
      [email, password_hash, full_name]
    );
    return result.insertId;
  },

  async updateProfile(id, fields) {
    const allowed = [
      'full_name', 'avatar_url', 'headline', 'bio', 'location', 'phone',
      'years_experience', 'preferred_role', 'preferred_location',
      'preferred_type', 'expected_salary', 'resume_url', 'resume_parsed_text',
      'onboarding_step', 'onboarding_complete',
    ];

    const updates = [];
    const values  = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }

    if (updates.length === 0) return false;

    values.push(id);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  },

  async touchLastLogin(id) {
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [id]
    );
  },

  //skills
  async getSkills(userId) {
    const [rows] = await pool.query(
      `SELECT s.id, s.name, s.category, us.proficiency, us.years_used
       FROM user_skills us
       JOIN skills s ON s.id = us.skill_id
       WHERE us.user_id = ?
       ORDER BY s.name`,
      [userId]
    );
    return rows;
  },

  async setSkills(userId, skills) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('DELETE FROM user_skills WHERE user_id = ?', [userId]);

      if (skills.length > 0) {
        const values = skills.map(s => [userId, s.skill_id, s.proficiency || 'intermediate', s.years_used || 0]);
        await conn.query(
          'INSERT INTO user_skills (user_id, skill_id, proficiency, years_used) VALUES ?',
          [values]
        );
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = UserModel;
