const { pool } = require('../config/db');

const InternshipModel = {

  async findAll({ work_type, location, search, limit = 50, offset = 0 } = {}) {
    let where = ['i.is_active = 1'];
    const params = [];

    if (work_type && work_type !== 'all') {
      where.push('i.work_type = ?');
      params.push(work_type);
    }
    if (location) {
      where.push('i.location LIKE ?');
      params.push(`%${location}%`);
    }
    if (search) {
      where.push('(i.title LIKE ? OR c.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = where.join(' AND ');

    const [internships] = await pool.query(
      `SELECT
         i.id, i.title, i.location, i.work_type, i.stipend_min, i.stipend_max,
         i.duration_months, i.application_deadline, i.posted_at, i.slots, i.min_experience,
         c.id AS company_id, c.name AS company_name, c.logo_url, c.industry, c.website
       FROM internships i
       JOIN companies c ON c.id = i.company_id
       WHERE ${whereClause}
       ORDER BY i.posted_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    if (internships.length === 0) return [];

    const ids = internships.map(r => r.id);
    const [skills] = await pool.query(
      `SELECT ins.internship_id, s.id AS skill_id, s.name, s.category, ins.is_required
       FROM internship_skills ins
       JOIN skills s ON s.id = ins.skill_id
       WHERE ins.internship_id IN (?)`,
      [ids]
    );

    // group skills by internship_id
    const skillMap = {};
    for (const sk of skills) {
      if (!skillMap[sk.internship_id]) skillMap[sk.internship_id] = [];
      skillMap[sk.internship_id].push(sk);
    }

    return internships.map(i => ({
      ...i,
      skills: skillMap[i.id] || [],
    }));
  },

  async findById(id) { // find intern by id
    const [[internship]] = await pool.query(
      `SELECT
         i.*, c.name AS company_name, c.logo_url, c.website,
         c.industry, c.size AS company_size, c.description AS company_description,
         c.location AS company_location
       FROM internships i
       JOIN companies c ON c.id = i.company_id
       WHERE i.id = ? AND i.is_active = 1 LIMIT 1`,
      [id]
    );

    if (!internship) return null;

    const [skills] = await pool.query(
      `SELECT s.id AS skill_id, s.name, s.category, ins.is_required
       FROM internship_skills ins
       JOIN skills s ON s.id = ins.skill_id
       WHERE ins.internship_id = ?`,
      [id]
    );

    return { ...internship, skills };
  },

  async count(filters = {}) {
    let where = ['i.is_active = 1'];
    const params = [];

    if (filters.work_type && filters.work_type !== 'all') {
      where.push('i.work_type = ?');
      params.push(filters.work_type);
    }
    if (filters.search) {
      where.push('(i.title LIKE ? OR c.name LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM internships i JOIN companies c ON c.id = i.company_id WHERE ${where.join(' AND ')}`,
      params
    );
    return total;
  },

  async getAllSkills() { //get all skills
    const [rows] = await pool.query(
      'SELECT id, name, category FROM skills ORDER BY category, name'
    );
    return rows;
  },
};

module.exports = InternshipModel;
