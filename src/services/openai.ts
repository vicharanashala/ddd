interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface QuizResponse {
  questions: QuizQuestion[];
}

export const generateQuizFromTranscript = async (transcript: string): Promise<QuizQuestion[]> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI API key not found. Using fallback quiz generation.');
    return generateFallbackQuiz(transcript);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an educational quiz generator. Generate exactly 1 multiple-choice question based on the provided transcript. 
            
            Return your response in this exact JSON format:
            {
              "questions": [
                {
                  "question": "Your question here",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correct_answer": 0,
                  "explanation": "Explanation of why this answer is correct"
                }
              ]
            }
            
            Make sure the question tests understanding of key concepts from the transcript.`
          },
          {
            role: 'user',
            content: `Generate a quiz question based on this transcript: ${transcript}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    try {
      const quizData: QuizResponse = JSON.parse(content);
      return quizData.questions || [];
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return generateFallbackQuiz(transcript);
    }
  } catch (error) {
    console.error('Error generating quiz with OpenAI:', error);
    return generateFallbackQuiz(transcript);
  }
};

// Fallback quiz generation when OpenAI is not available
const generateFallbackQuiz = (transcript: string): QuizQuestion[] => {
  const topics = extractTopicsFromTranscript(transcript);
  const mainTopic = topics[0] || 'the content';
  
  const fallbackQuestions = [
    {
      question: `What is the main concept discussed in this segment about ${mainTopic}?`,
      options: [
        `Understanding ${mainTopic} fundamentals`,
        'Advanced debugging techniques',
        'Database optimization',
        'User interface design'
      ],
      correct_answer: 0,
      explanation: `This segment focuses on the fundamental concepts of ${mainTopic}, which is essential for building a strong foundation.`
    },
    {
      question: `Which of the following best describes the approach mentioned for ${mainTopic}?`,
      options: [
        'Trial and error method',
        'Systematic and structured approach',
        'Random implementation',
        'Copy-paste from examples'
      ],
      correct_answer: 1,
      explanation: 'A systematic and structured approach is always recommended for learning and implementing new concepts effectively.'
    },
    {
      question: `What is the key benefit of understanding ${mainTopic}?`,
      options: [
        'Faster development',
        'Better code quality',
        'Improved problem-solving skills',
        'All of the above'
      ],
      correct_answer: 3,
      explanation: 'Understanding core concepts leads to faster development, better code quality, and improved problem-solving skills.'
    }
  ];
  
  // Return a random question from the fallback set
  const randomIndex = Math.floor(Math.random() * fallbackQuestions.length);
  return [fallbackQuestions[randomIndex]];
};

// Extract topics from transcript for better fallback questions
const extractTopicsFromTranscript = (transcript: string): string[] => {
  const commonTopics = [
    'JavaScript', 'React', 'Python', 'HTML', 'CSS', 'Node.js', 'API', 'Database',
    'Algorithm', 'Data Structure', 'Function', 'Variable', 'Loop', 'Condition',
    'Object', 'Array', 'String', 'Number', 'Boolean', 'Programming', 'Development',
    'Web Development', 'Frontend', 'Backend', 'Full Stack', 'Machine Learning',
    'Artificial Intelligence', 'Data Science', 'DevOps', 'Cloud Computing'
  ];
  
  const foundTopics = commonTopics.filter(topic => 
    transcript.toLowerCase().includes(topic.toLowerCase())
  );
  
  return foundTopics.length > 0 ? foundTopics : ['programming'];
};