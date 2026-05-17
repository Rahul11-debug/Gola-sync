const Groq = require("groq-sdk");
const Goal = require('../models/Goal');
const QuarterlyUpdate = require('../models/QuarterlyUpdate');
const User = require('../models/User');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Core AI call helper
 */
async function callGemini(systemPrompt, userMessage, max_tokens = 500) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userMessage
      }
    ],
    temperature: 0.7,
    max_tokens
  });

  return completion.choices[0]?.message?.content || '';
}

/**
 * Multi-turn chat helper
 */
async function callGeminiChat(systemPrompt, history, newMessage, max_tokens = 400) {
  const messages = [
    {
      role: "system",
      content: systemPrompt
    },
    ...history.map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content
    })),
    {
      role: "user",
      content: newMessage
    }
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.7,
    max_tokens
  });

  return completion.choices[0]?.message?.content || '';
}

// POST /api/ai/smart-goal
const generateSmartGoal = async (req, res, next) => {
  try {
    const { vague_goal } = req.body;

    if (!vague_goal) {
      return res.status(400).json({
        success: false,
        message: 'vague_goal is required'
      });
    }

    const system = `You are a professional OKR and goal-setting coach.
Convert vague employee goals into SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound).
Respond ONLY with a valid JSON object.
Schema:
{
"title": string,
"description": string,
"target": number,
"uom_type": "numeric"|"percentage"|"timeline"|"zero_based"|"max_type",
"deadline_suggestion": "YYYY-MM-DD",
"thrust_area": string
}`;

    const raw = await callGemini(
      system,
      `Convert this goal to SMART format: "${vague_goal}"`,
      400
    );

    let suggestion;

    try {
      suggestion = JSON.parse(raw);
    } catch {
      suggestion = JSON.parse(raw.replace(/```json|```/g, '').trim());
    }

    res.json({
      success: true,
      suggestion
    });

  } catch (err) {
    next(err);
  }
};

// POST /api/ai/performance-summary
const generatePerformanceSummary = async (req, res, next) => {
  try {
    const { employee_id, quarter } = req.body;

    const employee = await User.findById(employee_id).select('name department');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const goals = await Goal.find({ employee_id, quarter });
    const updates = await QuarterlyUpdate.find({
      goal_id: { $in: goals.map(g => g._id) }
    });

    const goalSummary = goals.map(g => {
      const upd = updates.find(
        u => u.goal_id.toString() === g._id.toString()
      );

      return {
        title: g.title,
        target: g.target,
        uom_type: g.uom_type,
        weightage: g.weightage,
        actual: upd?.actual ?? 'Not updated',
        progress_score: upd?.progress_score ?? 0,
        status: upd?.status ?? 'not_started'
      };
    });

    const system = `You are an HR analytics assistant.
Generate a concise professional 3-5 sentence performance summary.
Be specific with numbers.
End with one actionable suggestion.`;

    const userMessage = `
Employee: ${employee.name} (${employee.department})
Quarter: ${quarter}
Goals:
${JSON.stringify(goalSummary, null, 2)}
`;

    const summary = await callGemini(system, userMessage, 400);

    res.json({
      success: true,
      summary
    });

  } catch (err) {
    next(err);
  }
};

// POST /api/ai/risk-report
const generateRiskReport = async (req, res, next) => {
  try {
    const { quarter } = req.body;

    const employees = await User.find(
      { manager_id: req.user._id },
      '_id name'
    );

    const empIds = employees.map(e => e._id);

    const goals = await Goal.find({
      employee_id: { $in: empIds },
      quarter
    }).populate('employee_id', 'name');

    const updates = await QuarterlyUpdate.find({
      goal_id: { $in: goals.map(g => g._id) }
    });

    const atRisk = goals
      .filter(g => {
        const upd = updates.find(
          u => u.goal_id.toString() === g._id.toString()
        );

        return !upd || upd.progress_score < 40;
      })
      .map(g => ({
        employee: g.employee_id?.name,
        goal: g.title,
        progress:
          updates.find(
            u => u.goal_id.toString() === g._id.toString()
          )?.progress_score ?? 0
      }));

    const system = `You are an HR risk analyst.
Analyze at-risk employee goals.
Write a short manager-friendly summary.
Highlight patterns and suggest actions.`;

    const summary = await callGemini(
      system,
      `Quarter: ${quarter}\nAt-risk goals:\n${JSON.stringify(atRisk, null, 2)}`,
      400
    );

    res.json({
      success: true,
      at_risk_count: atRisk.length,
      at_risk_goals: atRisk,
      summary
    });

  } catch (err) {
    next(err);
  }
};

// POST /api/ai/chat
const chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    const { user } = req;

    let context = '';

    if (user.role === 'manager') {
      const employees = await User.find(
        { manager_id: user._id },
        'name'
      );

      context = `Manager has ${employees.length} employees: ${employees.map(e => e.name).join(', ')}`;
    }

    if (user.role === 'employee') {
      const goals = await Goal.find({
        employee_id: user._id
      }).select('title status');

      context = `Employee goals: ${goals.map(g => `${g.title} (${g.status})`).join(', ')}`;
    }

    const system = `You are an AI assistant inside a goal management portal.
Current user: ${user.name} (${user.role})
${context}
Answer clearly and honestly.`;

    const reply = await callGeminiChat(
      system,
      history,
      message,
      400
    );

    res.json({
      success: true,
      reply
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateSmartGoal,
  generatePerformanceSummary,
  generateRiskReport,
  chat
};