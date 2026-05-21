const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();

const Groq = require('groq-sdk');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL_ID = 'llama-3.1-8b-instant';
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

// Knowledge base about CampusSkillSwap
const CAMPUS_SKILLSWAP_KNOWLEDGE = `
You are a helpful assistant for CampusSkillSwap, a campus-based skill-sharing platform. Here's what you know:

ABOUT CAMPUSSKILLSWAP:
- It's a platform where students connect via campus emails to exchange skills
- Students can share skills like programming, design, languages, music, sports, etc.
- Features include: skill matching, friend system, real-time chat, feedback ratings

KEY FEATURES:
1. Skill Exchange: Post skills you want to share and find skills you want to learn
2. Friend System: Connect with other students, send/accept friend requests
3. Real-time Chat: Message friends directly for skill coordination
4. Feedback & Ratings: Rate other students' teaching (1-5 stars)
5. Recommendations: Get personalized recommendations for skills and friends
6. Admin Dashboard: Admins can manage users and content

HOW TO USE:
- Register with your campus email (e.g., @university.edu)
- Complete your profile with skills
- Browse other students' profiles
- Send friend requests
- Chat with friends to arrange skill exchanges
- Rate each other after interactions
- Check recommendations for new connections

SKILLS YOU CAN EXCHANGE:
- Programming (Python, JavaScript, Java, etc.)
- Languages (Spanish, French, Chinese, etc.)
- Music & Instruments
- Sports & Fitness
- Academic Subjects
- Design & Art
- Business & Entrepreneurship
- And many more!

For questions, provide helpful, friendly guidance about the platform.
`;

const systemPrompt = `${CAMPUS_SKILLSWAP_KNOWLEDGE}

You are helpful, friendly, and focused on CampusSkillSwap. Keep responses concise (2-3 sentences max).
If asked about the dashboard, describe the student dashboard features (search users/skills, stats, tabs for users/conversations/popular skills, recommendations).
Do not mention admin features unless the user explicitly asks about admin or moderation.
If asked about something not related to CampusSkillSwap, politely redirect to the platform.`;

const fallbackResponses = [
  {
    keywords: ['friend', 'request', 'connect'],
    response: 'Go to the Friends section, browse users, and click Send Request on a profile. Once accepted, you can chat and exchange skills.',
  },
  {
    keywords: ['skill', 'post', 'offer', 'learn'],
    response: 'Update your profile with skills you offer and want to learn. You can then browse users and send requests to match skills.',
  },
  {
    keywords: ['rating', 'feedback', 'review'],
    response: 'After a skill session, open Feedback and leave a rating (1-5) with a short review. Ratings appear on profiles.',
  },
  {
    keywords: ['recommend', 'suggest', 'match'],
    response: 'Check Recommendations to see suggested friends and skills based on your profile and activity.',
  },
  {
    keywords: ['chat', 'message'],
    response: 'Open Chat from the sidebar to message friends in real time and coordinate skill sessions.',
  },
  {
    keywords: ['report', 'issue', 'problem'],
    response: 'If you face an issue, contact an admin or use the platform support guidance. I can help you find the right section.',
  },
  {
    keywords: ['login', 'register', 'signup', 'sign up'],
    response: 'Use the Login or Register page with your campus email to get started. After login, complete your profile.',
  },
];

function getFallbackResponse(message) {
  const normalized = message.toLowerCase();
  const matched = fallbackResponses.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (matched) {
    return matched.response;
  }

  return 'I can help with skills, friends, chat, feedback, and recommendations. What would you like to know about CampusSkillSwap?';
}

async function callGroqAPI(userMessage) {
  try {
    if (!groq) {
      return getFallbackResponse(userMessage);
    }

    const response = await groq.chat.completions.create({
      model: GROQ_MODEL_ID,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const content = response?.choices?.[0]?.message?.content;
    if (content) {
      return content.trim();
    }

    return getFallbackResponse(userMessage);
  } catch (error) {
    console.error('Groq API Error:', error?.message || error);
    return getFallbackResponse(userMessage);
  }
}

// Send message to chatbot
router.post('/message', auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (!GROQ_API_KEY) {
      const fallbackResponse = getFallbackResponse(message);
      return res.json({
        success: true,
        response: fallbackResponse,
        timestamp: new Date(),
      });
    }

    const botResponse = await callGroqAPI(message);

    res.json({
      success: true,
      response: botResponse,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({
      error: 'Failed to process message',
      message: error.message,
    });
  }
});

module.exports = router;
