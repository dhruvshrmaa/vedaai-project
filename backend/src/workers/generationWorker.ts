import dotenv from 'dotenv';
dotenv.config();

import { Worker } from 'bullmq';
import Anthropic from '@anthropic-ai/sdk';
import Assignment from '../models/Assignment';
import { connectDB } from '../config/db';

connectDB();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const worker = new Worker('assignment-generation', async (job) => {
  const { assignmentId } = job.data;

  try {
    // Get assignment from DB
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    // Update status to processing
    assignment.status = 'processing';
    await assignment.save();

    // Build prompt
    const prompt = `Generate a question paper with the following details:
    - Subject: ${assignment.subject}
    - Total Questions: ${assignment.numberOfQuestions}
    - Total Marks: ${assignment.totalMarks}
    - Difficulty: ${assignment.difficulty}
    - Question Types: ${assignment.questionTypes.join(', ')}
    - Additional Instructions: ${assignment.additionalInstructions}

    Return ONLY a valid JSON object in this exact format:
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
    }`;

    // Call Claude API
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    // Parse response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const generatedPaper = JSON.parse(cleanJson);

    // Save result
    assignment.generatedPaper = generatedPaper;
    assignment.status = 'completed';
    await assignment.save();

    console.log(`Assignment ${assignmentId} generated successfully!`);

  } catch (error) {
    console.error(`Error generating assignment ${assignmentId}:`, error);
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
  }
}, {
  connection: {
    host: process.env.UPSTASH_REDIS_HOST as string,
    port: 6379,
    password: process.env.UPSTASH_REDIS_REST_TOKEN as string,
    tls: { rejectUnauthorized: false }
  }
});

console.log('Worker is running...');

export default worker;