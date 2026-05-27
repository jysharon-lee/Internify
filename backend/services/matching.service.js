/**
 *  INTERNIFY — MATCHING ENGINE
 *  Score formula (0–100):
 *    skillScore       × 0.60   (required skill overlap)
 *    preferenceScore  × 0.25   (work type + location + salary)
 *    experienceScore  × 0.15   (years_experience vs min_experience)
 */

const WEIGHTS = {
  skill:      0.60,
  preference: 0.25,
  experience: 0.15,
};

function computeMatchScore(user, internship) {
  const skillResult      = _scoreSkills(user, internship);
  const preferenceResult = _scorePreferences(user, internship);
  const experienceResult = _scoreExperience(user, internship);

  const rawScore =
    skillResult.score      * WEIGHTS.skill +
    preferenceResult.score * WEIGHTS.preference +
    experienceResult.score * WEIGHTS.experience;

  const score = Math.round(rawScore);

  return {
    score,
    breakdown: {
      skillScore:      Math.round(skillResult.score),
      preferenceScore: Math.round(preferenceResult.score),
      experienceScore: Math.round(experienceResult.score),
    },
    matchedSkills:    skillResult.matched,
    missingSkills:    skillResult.missing,
    niceToHaveSkills: skillResult.niceToHave,
    preferenceNotes:  preferenceResult.notes,
    explanation:      _buildExplanation(score, skillResult, preferenceResult, experienceResult),
  };
}

// sub-scorers

function _scoreSkills(user, internship) {
  const userSkillIds = new Set((user.skills || []).map(s => s.skill_id ?? s.id));

  const required    = internship.skills.filter(s => s.is_required);
  const niceToHave  = internship.skills.filter(s => !s.is_required);

  const matchedRequired    = required.filter(s => userSkillIds.has(s.skill_id ?? s.id));
  const matchedNiceToHave  = niceToHave.filter(s => userSkillIds.has(s.skill_id ?? s.id));
  const missingRequired    = required.filter(s => !userSkillIds.has(s.skill_id ?? s.id));

  // base score
  let score = required.length > 0
    ? (matchedRequired.length / required.length) * 100
    : 100; 

  // bonus
  if (niceToHave.length > 0) {
    const bonus = (matchedNiceToHave.length / niceToHave.length) * 10;
    score = Math.min(100, score + bonus);
  }

  return {
    score,
    matched:    matchedRequired.map(s => s.name),
    missing:    missingRequired.map(s => s.name),
    niceToHave: matchedNiceToHave.map(s => s.name),
  };
}

//preference scorer
function _scorePreferences(user, internship) {
  let score = 0;
  const notes = [];

  // work type match 
  const userType      = (user.preferred_type || 'any').toLowerCase();
  const internType    = (internship.work_type || '').toLowerCase();
  const typeAliases   = { 'hybrid': ['hybrid','full-time'], 'remote': ['remote'] };

  if (userType === 'any') {
    score += 40;
    notes.push('Open to any work type ✓');
  } else if (userType === internType || (typeAliases[userType] || []).includes(internType)) {
    score += 40;
    notes.push(`Work type match: ${internType} ✓`);
  } else {
    notes.push(`Work type mismatch: you prefer ${userType}, this is ${internType}`);
  }

  // location match
  const userLoc   = (user.preferred_location || '').toLowerCase();
  const internLoc = (internship.location || '').toLowerCase();

  if (!userLoc || userLoc === 'anywhere') {
    score += 30;
    notes.push('No location preference ✓');
  } else if (internLoc.includes('remote')) {
    score += 30;
    notes.push('Remote role — matches any location ✓');
  } else if (internLoc.includes(userLoc) || userLoc.includes(internLoc)) {
    score += 30;
    notes.push(`Location match: ${internship.location} ✓`);
  } else if (internLoc.includes('malaysia') && userLoc !== '') {
    score += 15; // partial 
    notes.push(`Location partial match: ${internship.location}`);
  } else {
    notes.push(`Location mismatch: you prefer ${user.preferred_location}, this is in ${internship.location}`);
  }

  const userSalary = user.expected_salary;
  const stipendMin = internship.stipend_min;
  const stipendMax = internship.stipend_max;

  if (!userSalary || (!stipendMin && !stipendMax)) {
    score += 30; // no data 
    notes.push('Stipend: no expectation set ✓');
  } else if (stipendMax && userSalary <= stipendMax) {
    score += 30;
    notes.push(`Stipend within range: MYR ${stipendMin}–${stipendMax} ✓`);
  } else if (stipendMin && userSalary <= stipendMin * 1.2) {
    score += 15; // close but over
    notes.push(`Stipend slightly below expectation: MYR ${stipendMin}–${stipendMax}`);
  } else {
    notes.push(`Stipend below expectation: MYR ${stipendMin}–${stipendMax}, you expect MYR ${userSalary}`);
  }

  return { score, notes };
}

function _scoreExperience(user, internship) {
  const userYears = Number(user.years_experience) || 0;
  const required  = Number(internship.min_experience) || 0;

  if (required === 0) return { score: 100, note: 'No experience required ✓' };
  if (userYears >= required) return { score: 100, note: `${userYears} years meets ${required} year(s) required ✓` };

  // ratio of experience
  const ratio = userYears / required;
  return {
    score: Math.round(ratio * 100),
    note: `You have ${userYears} year(s), role requires ${required} year(s)`,
  };
}

function _buildExplanation(score, skillResult, preferenceResult, experienceResult) {
  const lines = [];

  if (score >= 85)      lines.push('Excellent match! You are a strong candidate for this role.');
  else if (score >= 70) lines.push('Good match. You meet most of the requirements.');
  else if (score >= 50) lines.push('Partial match. Consider building some missing skills.');
  else                  lines.push('Low match. This role may be challenging without the required skills.');

  if (skillResult.matched.length > 0) {
    lines.push(`Skills you have: ${skillResult.matched.join(', ')}.`);
  }
  if (skillResult.missing.length > 0) {
    lines.push(`Missing required skills: ${skillResult.missing.join(', ')}.`);
  }
  if (skillResult.niceToHave.length > 0) {
    lines.push(`Bonus skills you have: ${skillResult.niceToHave.join(', ')}.`);
  }
  if (experienceResult.note) {
    lines.push(experienceResult.note);
  }

  return lines.join(' ');
}

//compute and sort match scores for a list of internships against a user profile
//returns internships sorted by score descending, each with a match field

function rankInternships(user, internships) {
  return internships
    .map(internship => ({
      ...internship,
      match: computeMatchScore(user, internship),
    }))
    .sort((a, b) => b.match.score - a.match.score);
}

module.exports = { computeMatchScore, rankInternships };
