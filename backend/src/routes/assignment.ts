import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import Assignment from '../models/Assignment';
import OpenAI from 'openai';

const router = express.Router();

/**
 * OpenRouter Setup (FREE AI)
 */
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// Create Assignment
router.post('/create', async (req, res) => {
  try {
    const {
      title,
      subject,
      dueDate,
      questionTypes,
      numberOfQuestions,
      totalMarks,
      difficulty,
      additionalInstructions,
    } = req.body;

    if (
      !title ||
      !subject ||
      !dueDate ||
      !numberOfQuestions ||
      !totalMarks
    ) {
      return res.status(400).json({
        message: 'Please fill all required fields',
      });
    }

    if (numberOfQuestions <= 0 || totalMarks <= 0) {
      return res.status(400).json({
        message: 'Questions and marks must be positive',
      });
    }

    const assignment = new Assignment({
      title,
      subject,
      dueDate,
      questionTypes,
      numberOfQuestions,
      totalMarks,
      difficulty,
      additionalInstructions,
      status: 'pending',
    });

    await assignment.save();

    // Background generation
    generatePaper(assignment._id.toString());

    res.status(201).json({
      message: 'Assignment created! Generating question paper...',
      assignmentId: assignment._id,
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Background AI generation
async function generatePaper(assignmentId: string) {
  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return;

    assignment.status = 'processing';
    await assignment.save();

    const prompt = `
Generate a question paper with the following details:

Subject: ${assignment.subject}
Total Questions: ${assignment.numberOfQuestions}
Total Marks: ${assignment.totalMarks}
Difficulty: ${assignment.difficulty}
Question Types: ${assignment.questionTypes.join(', ')}
Additional Instructions: ${assignment.additionalInstructions}

Return ONLY valid JSON in this format:

{
  "title": "Question Paper Title",
  "subject": "Subject Name",
  "totalMarks": 100,
  "duration": "3 hours",
  "sections": [
    {
      "name": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "questionNumber": 1,
          "text": "Question text here",
          "marks": 5,
          "difficulty": "easy"
        }
      ]
    }
  ]
}
`;

    // OpenRouter AI Call - Using GPT-3.5 Turbo
    let completion;
    try {
      completion = await client.chat.completions.create({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
    } catch (aiError: any) {
      if (aiError.status === 429) {
        throw new Error('QUOTA_EXCEEDED: ' + (aiError.message || 'Rate limit exceeded'));
      }
      if (aiError.status === 404) {
        throw new Error('MODEL_NOT_FOUND: ' + (aiError.message || 'Model endpoint not available'));
      }
      throw aiError;
    }

    const responseText = completion.choices[0].message.content || '';

    console.log('AI RESPONSE:', responseText);

    // Clean JSON
    const cleanJson = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let generatedPaper;

    try {
      generatedPaper = JSON.parse(cleanJson);
    } catch (err) {
      console.log('JSON Parse Error, fallback used');

      generatedPaper = {
        title: assignment.title,
        subject: assignment.subject,
        totalMarks: assignment.totalMarks,
        duration: '3 hours',
        sections: [
          {
            name: 'Section A',
            instruction: 'Attempt all questions',
            questions: [
              {
                questionNumber: 1,
                text: responseText,
                marks: 5,
                difficulty: assignment.difficulty,
              },
            ],
          },
        ],
      };
    }

    assignment.generatedPaper = generatedPaper;
    assignment.status = 'completed';

    await assignment.save();

    console.log(`Assignment ${assignmentId} generated successfully!`);
  } catch (error) {
    console.error('Generation error:', error);

    let errorMessage = 'Failed to generate question paper';

    if (error instanceof Error) {
      const errorMsg = error.message;
      
      if (errorMsg.includes('QUOTA_EXCEEDED')) {
        errorMessage = 'API quota exceeded. Please try again tomorrow or upgrade your plan.';
      } else if (errorMsg.includes('429')) {
        errorMessage = 'Too many requests. Please wait a few moments and try again.';
      } else if (errorMsg.includes('MODEL_NOT_FOUND') || errorMsg.includes('404')) {
        errorMessage = 'AI model unavailable. Please contact support.';
      } else if (errorMsg.includes('Network') || errorMsg.includes('ECONNREFUSED')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (errorMsg.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      }
    }

    await Assignment.findByIdAndUpdate(assignmentId, {
      status: 'failed',
      errorMessage: errorMessage,
    });
  }
}

// Get Assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        message: 'Assignment not found',
      });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
    });
  }
});

// Get All Assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({
      createdAt: -1,
    });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
    });
  }
});

export default router;