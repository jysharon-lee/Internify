const ApplicationModel = require('../models/application.model');
const { createError } = require('../middleware/error.middleware');

//summary of applications
exports.summary = async (req, res, next) => {
  try {
    const [byStage, recent] = await Promise.all([
      ApplicationModel.countByStage(req.user.id),
      ApplicationModel.recent(req.user.id, 5),
    ]);

    // calculate totals and rates
    const stageMap = {};
    let totalApps = 0;

    for (const row of byStage) {
      stageMap[row.stage] = row.count;
      totalApps += row.count;
    }

    const saved     = stageMap.saved || 0;
    const applied   = stageMap.applied || 0;
    const interview = stageMap.interview || 0;
    const offers    = stageMap.offer || 0;

    // success rate 
    const successRate = applied > 0 ? Math.round((offers / applied) * 100) : 0;

    // progress rate 
    const activeApps = applied + interview + offers;
    const progressRate = totalApps > 0 ? Math.round((activeApps / totalApps) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalApplications: totalApps,
        byStage: {
          saved,
          applied,
          interview,
          offers,
          rejected: stageMap.rejected || 0,
        },
        metrics: {
          successRate,     
          progressRate,    
          avgTimeToOffer:  0,
        },
        recentApplications: recent,
      },
    });
  } catch (err) {
    next(err);
  }
};

//application per week
exports.applicationsPerWeek = async (req, res, next) => {
  try {
    const weeks = req.query.weeks ? Number(req.query.weeks) : 8;
    const rows = await ApplicationModel.countByWeek(req.user.id, weeks);

    // format for chart
    const data = rows.map(row => ({
      week:  row.week_start,
      count: row.count,
    }));

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

//get score
exports.scoreDistribution = async (req, res, next) => {
  try {
    const rows = await ApplicationModel.avgScoreByStage(req.user.id);

    const data = rows.map(row => ({
      stage:     row.stage,
      avgScore:  row.avg_score || 0,
      count:     row.count,
    }));

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

//analytucs report
exports.fullReport = async (req, res, next) => {
  try {
    const [summary, appsByWeek, scoreByStage] = await Promise.all([
      _getSummaryData(req.user.id),
      ApplicationModel.countByWeek(req.user.id, 8),
      ApplicationModel.avgScoreByStage(req.user.id),
    ]);

    res.json({
      success: true,
      data: {
        summary,
        applications_per_week: appsByWeek.map(r => ({
          week:  r.week_start,
          count: r.count,
        })),
        score_by_stage: scoreByStage.map(r => ({
          stage:     r.stage,
          avg_score: r.avg_score || 0,
          count:     r.count,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

//private helpers

async function _getSummaryData(userId) {
  const byStage = await ApplicationModel.countByStage(userId);
  const stageMap = {};
  let totalApps = 0;

  for (const row of byStage) {
    stageMap[row.stage] = row.count;
    totalApps += row.count;
  }

  const applied = stageMap.applied || 0;
  const offers  = stageMap.offer || 0;

  return {
    totalApplications: totalApps,
    byStage: stageMap,
    successRate: applied > 0 ? Math.round((offers / applied) * 100) : 0,
  };
}
