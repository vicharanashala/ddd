import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, CheckCircle, X, Brain, Award, Clock, Target, Maximize, Minimize, PictureInPicture } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { generateQuizFromTranscript } from '../../services/openai';

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface VideoSegment {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  transcript: string;
  quiz?: QuizQuestion;
}

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onComplete?: () => void;
  onProgress?: (watchTime: number) => void;
  onQuizComplete?: (correctAnswers: number, totalQuestions: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  title, 
  onComplete, 
  onProgress,
  onQuizComplete 
}) => {
  const { darkMode } = useTheme();
  const { updateProgress } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchTime, setWatchTime] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedSegments, setCompletedSegments] = useState<Set<number>>(new Set());
  const [totalProblemsAnswered, setTotalProblemsAnswered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [actualWatchTime, setActualWatchTime] = useState(0);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // Check if video is YouTube
  useEffect(() => {
    const isYouTubeVideo = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    setIsYouTube(isYouTubeVideo);
    
    if (isYouTubeVideo) {
      loadYouTubeAPI();
    }
  }, [videoUrl]);

  // Load YouTube API
  const loadYouTubeAPI = () => {
    if (window.YT) {
      initializeYouTubePlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      initializeYouTubePlayer();
    };
  };

  // Initialize YouTube player
  const initializeYouTubePlayer = () => {
    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) return;

    youtubePlayerRef.current = new window.YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        cc_load_policy: 0,
        iv_load_policy: 3,
        autohide: 0
      },
      events: {
        onReady: (event: any) => {
          setYoutubeReady(true);
          setDuration(event.target.getDuration());
          generateSegments(event.target.getDuration());
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          }
        }
      }
    });
  };

  // Get YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Generate dynamic segments based on video duration (2-minute chunks)
  const generateSegments = async (videoDuration: number) => {
    const segmentDuration = 120; // 2 minutes in seconds
    const numSegments = Math.ceil(videoDuration / segmentDuration);
    
    const newSegments: VideoSegment[] = [];
    
    for (let i = 0; i < numSegments; i++) {
      const startTime = i * segmentDuration;
      const endTime = Math.min((i + 1) * segmentDuration, videoDuration);
      
      // Generate AI-like content based on topic and segment
      const segmentData = await generateAIContent(title, i + 1, numSegments, startTime, endTime);
      
      newSegments.push({
        id: `segment-${i + 1}`,
        title: `${title} - Part ${i + 1}`,
        startTime,
        endTime,
        transcript: segmentData.transcript,
        quiz: segmentData.quiz
      });
    }
    
    setSegments(newSegments);
  };

  // AI-powered content generation based on video title and context
  const generateAIContent = async (videoTitle: string, segmentNumber: number, totalSegments: number, startTime: number, endTime: number) => {
    const topicKeywords = videoTitle.toLowerCase();
    const progressPercentage = (segmentNumber / totalSegments) * 100;
    
    let transcript = '';
    let quiz: QuizQuestion | undefined;
    
    if (topicKeywords.includes('javascript') || topicKeywords.includes('js')) {
      const jsContent = generateJavaScriptAIContent(segmentNumber, totalSegments);
      transcript = jsContent.transcript;
      
      // Generate quiz using OpenAI
      try {
        setQuizLoading(true);
        const quizQuestions = await generateQuizFromTranscript(transcript);
        quiz = quizQuestions[0];
      } catch (error) {
        console.error('Error generating quiz:', error);
        quiz = jsContent.quiz;
      } finally {
        setQuizLoading(false);
      }
    } else if (topicKeywords.includes('react')) {
      const reactContent = generateReactAIContent(segmentNumber, totalSegments);
      transcript = reactContent.transcript;
      
      try {
        setQuizLoading(true);
        const quizQuestions = await generateQuizFromTranscript(transcript);
        quiz = quizQuestions[0];
      } catch (error) {
        console.error('Error generating quiz:', error);
        quiz = reactContent.quiz;
      } finally {
        setQuizLoading(false);
      }
    } else if (topicKeywords.includes('python') || topicKeywords.includes('ai') || topicKeywords.includes('machine learning')) {
      const aiContent = generatePythonAIContent(segmentNumber, totalSegments);
      transcript = aiContent.transcript;
      
      try {
        setQuizLoading(true);
        const quizQuestions = await generateQuizFromTranscript(transcript);
        quiz = quizQuestions[0];
      } catch (error) {
        console.error('Error generating quiz:', error);
        quiz = aiContent.quiz;
      } finally {
        setQuizLoading(false);
      }
    } else if (topicKeywords.includes('data science') || topicKeywords.includes('analytics')) {
      const dsContent = generateDataScienceAIContent(segmentNumber, totalSegments);
      transcript = dsContent.transcript;
      
      try {
        setQuizLoading(true);
        const quizQuestions = await generateQuizFromTranscript(transcript);
        quiz = quizQuestions[0];
      } catch (error) {
        console.error('Error generating quiz:', error);
        quiz = dsContent.quiz;
      } finally {
        setQuizLoading(false);
      }
    } else if (topicKeywords.includes('html') || topicKeywords.includes('css') || topicKeywords.includes('web')) {
      const webContent = generateWebDevAIContent(segmentNumber, totalSegments);
      transcript = webContent.transcript;
      
      try {
        setQuizLoading(true);
        const quizQuestions = await generateQuizFromTranscript(transcript);
        quiz = quizQuestions[0];
      } catch (error) {
        console.error('Error generating quiz:', error);
        quiz = webContent.quiz;
      } finally {
        setQuizLoading(false);
      }
    } else {
      // Default AI-generated content
      const defaultContent = generateDefaultAIContent(segmentNumber, totalSegments, videoTitle);
      transcript = defaultContent.transcript;
      
      try {
        setQuizLoading(true);
        const quizQuestions = await generateQuizFromTranscript(transcript);
        quiz = quizQuestions[0];
      } catch (error) {
        console.error('Error generating quiz:', error);
        quiz = defaultContent.quiz;
      } finally {
        setQuizLoading(false);
      }
    }
    
    return { transcript, quiz };
  };

  // AI-generated JavaScript content
  const generateJavaScriptAIContent = (segment: number, total: number) => {
    const progressPercentage = (segment / total) * 100;
    
    const transcripts = [
      `Welcome to JavaScript fundamentals! In this ${Math.round(progressPercentage)}% of our journey, we'll explore variables, data types, and how JavaScript executes in the browser environment. Understanding these core concepts is crucial for building dynamic web applications.`,
      `Now we're diving deeper into JavaScript functions and scope. At ${Math.round(progressPercentage)}% completion, you'll learn about function declarations, expressions, arrow functions, and how closures work. These concepts form the backbone of JavaScript programming.`,
      `In this segment covering ${Math.round(progressPercentage)}% of our content, we explore object-oriented programming in JavaScript. You'll understand prototypes, classes, inheritance, and how to structure your code using modern ES6+ features.`,
      `We're now at ${Math.round(progressPercentage)}% through our JavaScript journey, focusing on asynchronous programming. Learn about promises, async/await, and how to handle API calls effectively in modern JavaScript applications.`,
      `In this final segment at ${Math.round(progressPercentage)}% completion, we cover advanced JavaScript patterns, error handling, and best practices for writing maintainable, scalable JavaScript code.`
    ];

    const quizzes = [
      {
        question: "Which of the following correctly declares a variable in modern JavaScript?",
        options: ["var name = 'John';", "let name = 'John';", "const name = 'John';", "All of the above"],
        correct_answer: 3,
        explanation: "All three keywords (var, let, const) can declare variables, though let and const are preferred in modern JavaScript for better scope control."
      },
      {
        question: "What is a closure in JavaScript?",
        options: ["A way to close the browser", "A function that has access to outer scope variables", "A type of loop", "A CSS property"],
        correct_answer: 1,
        explanation: "A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned."
      },
      {
        question: "What does 'hoisting' mean in JavaScript?",
        options: ["Moving code to the top", "Variable and function declarations are moved to the top of their scope", "Lifting heavy objects", "A debugging technique"],
        correct_answer: 1,
        explanation: "Hoisting is JavaScript's behavior of moving variable and function declarations to the top of their containing scope during compilation."
      },
      {
        question: "Which method is used to add an element to the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correct_answer: 0,
        explanation: "The push() method adds one or more elements to the end of an array and returns the new length of the array."
      },
      {
        question: "What is the difference between '==' and '===' in JavaScript?",
        options: ["No difference", "'==' checks type, '===' doesn't", "'===' checks type and value, '==' only value", "They're both deprecated"],
        correct_answer: 2,
        explanation: "The '===' operator checks both type and value (strict equality), while '==' performs type coercion before comparison."
      }
    ];

    return {
      transcript: transcripts[Math.min(segment - 1, transcripts.length - 1)],
      quiz: quizzes[Math.min(segment - 1, quizzes.length - 1)]
    };
  };

  // AI-generated React content
  const generateReactAIContent = (segment: number, total: number) => {
    const progressPercentage = (segment / total) * 100;
    
    const transcripts = [
      `Welcome to React development! At ${Math.round(progressPercentage)}% of our journey, we'll understand React's component-based architecture, JSX syntax, and how React efficiently updates the DOM using its virtual DOM algorithm.`,
      `Now at ${Math.round(progressPercentage)}% completion, we're exploring React hooks. useState and useEffect are fundamental hooks that allow functional components to manage state and side effects, revolutionizing how we write React applications.`,
      `In this ${Math.round(progressPercentage)}% segment, we dive into component composition and props. Learn how to build reusable components, pass data between parent and child components, and create maintainable React applications.`,
      `We're ${Math.round(progressPercentage)}% through our React course, focusing on state management. Understand the Context API, state lifting, and when to use external state management libraries like Redux or Zustand.`,
      `At ${Math.round(progressPercentage)}% completion, we cover React performance optimization. Learn about React.memo, useMemo, useCallback, and code splitting techniques to build fast, efficient React applications.`
    ];

    const quizzes = [
      {
        question: "What is JSX in React?",
        options: ["A CSS framework", "A syntax extension for JavaScript", "A database query language", "A testing library"],
        correct_answer: 1,
        explanation: "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files, making React components more readable."
      },
      {
        question: "What is the purpose of the useState hook?",
        options: ["To make API calls", "To manage component state in functional components", "To style components", "To handle routing"],
        correct_answer: 1,
        explanation: "useState is a React hook that allows functional components to have and manage local state."
      },
      {
        question: "What is the virtual DOM in React?",
        options: ["A real DOM element", "A JavaScript representation of the real DOM", "A CSS framework", "A database"],
        correct_answer: 1,
        explanation: "The virtual DOM is a JavaScript representation of the real DOM that React uses to efficiently calculate and apply updates."
      },
      {
        question: "When does useEffect run by default?",
        options: ["Only on component mount", "Only on component unmount", "After every render", "Only when props change"],
        correct_answer: 2,
        explanation: "useEffect runs after every render by default, but can be controlled with dependency arrays to optimize performance."
      },
      {
        question: "Which method is used to render a React component to the DOM?",
        options: ["ReactDOM.render()", "React.render()", "component.render()", "DOM.render()"],
        correct_answer: 0,
        explanation: "ReactDOM.render() is the method used to render React components to the DOM (though createRoot is preferred in React 18+)."
      }
    ];

    return {
      transcript: transcripts[Math.min(segment - 1, transcripts.length - 1)],
      quiz: quizzes[Math.min(segment - 1, quizzes.length - 1)]
    };
  };

  // AI-generated Python/AI content
  const generatePythonAIContent = (segment: number, total: number) => {
    const progressPercentage = (segment / total) * 100;
    
    const transcripts = [
      `Welcome to Python for AI and Machine Learning! At ${Math.round(progressPercentage)}% of our journey, we'll set up your development environment and explore Python's syntax that makes it perfect for data science and AI applications.`,
      `Now ${Math.round(progressPercentage)}% through our course, we're mastering data manipulation with pandas and numpy. These libraries are essential for cleaning, transforming, and analyzing datasets before feeding them to machine learning algorithms.`,
      `In this ${Math.round(progressPercentage)}% segment, we explore machine learning fundamentals. Understand supervised vs unsupervised learning, different algorithm types, and how to choose the right approach for your problem.`,
      `At ${Math.round(progressPercentage)}% completion, we dive into deep learning with neural networks. Learn how TensorFlow and Keras enable you to build powerful AI models that can recognize patterns in complex data.`,
      `We're ${Math.round(progressPercentage)}% complete, focusing on model evaluation and deployment. Learn to test model performance, avoid overfitting, and deploy your AI models to production environments.`
    ];

    const quizzes = [
      {
        question: "Which Python library is primarily used for numerical computing in AI?",
        options: ["pandas", "numpy", "matplotlib", "requests"],
        correct_answer: 1,
        explanation: "NumPy is the fundamental library for numerical computing in Python, providing support for large multi-dimensional arrays and mathematical functions."
      },
      {
        question: "What is supervised learning?",
        options: ["Learning without any data", "Learning with labeled training data", "Learning only from images", "Learning without supervision"],
        correct_answer: 1,
        explanation: "Supervised learning uses labeled training data to learn a mapping from inputs to outputs, allowing the model to make predictions on new data."
      },
      {
        question: "What is a neural network?",
        options: ["A computer network", "A mathematical model inspired by biological neural networks", "A social network", "A wireless network"],
        correct_answer: 1,
        explanation: "A neural network is a computational model inspired by biological neural networks, consisting of interconnected nodes (neurons) that process information."
      },
      {
        question: "Which library is commonly used for machine learning in Python?",
        options: ["scikit-learn", "requests", "flask", "django"],
        correct_answer: 0,
        explanation: "Scikit-learn is one of the most popular machine learning libraries in Python, providing simple and efficient tools for data analysis."
      },
      {
        question: "What does 'AI' stand for?",
        options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Integration", "Algorithmic Interface"],
        correct_answer: 1,
        explanation: "AI stands for Artificial Intelligence, which refers to machine intelligence that can perform tasks typically requiring human intelligence."
      }
    ];

    return {
      transcript: transcripts[Math.min(segment - 1, transcripts.length - 1)],
      quiz: quizzes[Math.min(segment - 1, quizzes.length - 1)]
    };
  };

  // AI-generated Data Science content
  const generateDataScienceAIContent = (segment: number, total: number) => {
    const progressPercentage = (segment / total) * 100;
    
    const transcripts = [
      `Welcome to Data Science! At ${Math.round(progressPercentage)}% of our journey, we'll understand the data science methodology, from problem definition to solution deployment, and how data drives decision-making in modern organizations.`,
      `Now ${Math.round(progressPercentage)}% through our course, we're mastering data collection and cleaning. Learn to work with various data sources, handle missing values, and prepare datasets for analysis using pandas and other tools.`,
      `In this ${Math.round(progressPercentage)}% segment, we explore exploratory data analysis (EDA) and visualization. Discover patterns, outliers, and insights using statistical methods and powerful visualization libraries like matplotlib and seaborn.`,
      `At ${Math.round(progressPercentage)}% completion, we dive into statistical analysis and hypothesis testing. Learn to validate findings, calculate confidence intervals, and make data-driven decisions with statistical significance.`,
      `We're ${Math.round(progressPercentage)}% complete, focusing on machine learning for data science. Implement predictive models, evaluate their performance, and learn to communicate insights effectively to stakeholders.`
    ];

    const quizzes = [
      {
        question: "What is the first step in the data science process?",
        options: ["Data cleaning", "Problem definition and understanding", "Model building", "Data visualization"],
        correct_answer: 1,
        explanation: "Problem definition and understanding is the crucial first step that guides all subsequent decisions in a data science project."
      },
      {
        question: "Which Python library is best for data manipulation?",
        options: ["numpy", "pandas", "matplotlib", "requests"],
        correct_answer: 1,
        explanation: "Pandas is the go-to library for data manipulation and analysis, providing powerful data structures and operations for structured data."
      },
      {
        question: "What does EDA stand for in data science?",
        options: ["Estimated Data Analysis", "Exploratory Data Analysis", "Extended Data Application", "Experimental Data Approach"],
        correct_answer: 1,
        explanation: "EDA stands for Exploratory Data Analysis, the process of analyzing datasets to summarize their main characteristics and discover patterns."
      },
      {
        question: "What is a p-value in statistical testing?",
        options: ["The probability of the data", "The probability of observing results as extreme as those observed, assuming the null hypothesis is true", "The percentage of variance", "The prediction value"],
        correct_answer: 1,
        explanation: "A p-value represents the probability of obtaining results at least as extreme as those observed, assuming the null hypothesis is true."
      },
      {
        question: "Which visualization is best for showing the distribution of a continuous variable?",
        options: ["Bar chart", "Histogram", "Pie chart", "Line chart"],
        correct_answer: 1,
        explanation: "Histograms are ideal for showing the distribution of continuous variables by displaying the frequency of values in different ranges."
      }
    ];

    return {
      transcript: transcripts[Math.min(segment - 1, transcripts.length - 1)],
      quiz: quizzes[Math.min(segment - 1, quizzes.length - 1)]
    };
  };

  // AI-generated Web Development content
  const generateWebDevAIContent = (segment: number, total: number) => {
    const progressPercentage = (segment / total) * 100;
    
    const transcripts = [
      `Welcome to Web Development! At ${Math.round(progressPercentage)}% of our journey, we'll explore HTML structure, semantic elements, and how to create well-structured, accessible web documents that form the foundation of all websites.`,
      `Now ${Math.round(progressPercentage)}% through our course, we're mastering CSS fundamentals. Learn about selectors, the box model, flexbox, and grid to create beautiful, responsive layouts that work across all devices.`,
      `In this ${Math.round(progressPercentage)}% segment, we dive into responsive design principles. Understand mobile-first design, media queries, and how to create websites that provide optimal viewing experiences across different screen sizes.`,
      `At ${Math.round(progressPercentage)}% completion, we explore advanced CSS techniques including animations, transitions, and modern layout methods that create engaging, interactive user interfaces.`,
      `We're ${Math.round(progressPercentage)}% complete, focusing on modern web development best practices. Learn about performance optimization, accessibility standards, and how to build maintainable, scalable web applications.`
    ];

    const quizzes = [
      {
        question: "What does HTML stand for?",
        options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink Text Markup Language"],
        correct_answer: 0,
        explanation: "HTML stands for HyperText Markup Language, the standard markup language for creating web pages and web applications."
      },
      {
        question: "Which CSS property is used to change text color?",
        options: ["font-color", "text-color", "color", "foreground-color"],
        correct_answer: 2,
        explanation: "The 'color' property is used to set the color of text in CSS."
      },
      {
        question: "What is the CSS box model?",
        options: ["A 3D model", "The rectangular boxes generated for elements, including content, padding, border, and margin", "A design pattern", "A JavaScript framework"],
        correct_answer: 1,
        explanation: "The CSS box model describes the rectangular boxes generated for elements, consisting of content, padding, border, and margin areas."
      },
      {
        question: "Which HTML element represents the most important heading?",
        options: ["<h6>", "<h1>", "<header>", "<title>"],
        correct_answer: 1,
        explanation: "The <h1> element represents the most important heading on a page, with <h6> being the least important in the heading hierarchy."
      },
      {
        question: "Which CSS layout method is best for one-dimensional layouts?",
        options: ["Grid", "Flexbox", "Float", "Position"],
        correct_answer: 1,
        explanation: "Flexbox is designed for one-dimensional layouts (either row or column), while Grid is better for two-dimensional layouts."
      }
    ];

    return {
      transcript: transcripts[Math.min(segment - 1, transcripts.length - 1)],
      quiz: quizzes[Math.min(segment - 1, quizzes.length - 1)]
    };
  };

  // Default AI-generated content
  const generateDefaultAIContent = (segment: number, total: number, title: string) => {
    const progressPercentage = (segment / total) * 100;
    
    const transcript = `Welcome to ${title}! You're now ${Math.round(progressPercentage)}% through this comprehensive course. In this segment, we'll cover essential concepts and practical applications that build upon previous lessons and prepare you for advanced topics ahead. Our AI-powered learning system adapts to your progress to ensure optimal understanding.`;
    
    const quiz = {
      question: `What is the main focus of this segment in ${title}?`,
      options: [
        "Building foundational understanding",
        "Advanced implementation only",
        "Historical context only",
        "Future predictions"
      ],
      correct_answer: 0,
      explanation: `This segment focuses on building a strong foundation in ${title} concepts that will support your continued learning journey.`
    };

    return { transcript, quiz };
  };

  // Video event handlers
  useEffect(() => {
    if (isYouTube && youtubePlayerRef.current && youtubeReady) {
      const checkTime = () => {
        if (youtubePlayerRef.current && isPlaying) {
          const currentVideoTime = youtubePlayerRef.current.getCurrentTime();
          setCurrentTime(currentVideoTime);
          
          // Check if current segment is completed (2 minutes watched)
          const currentSegmentData = segments[currentSegment];
          if (currentSegmentData && currentVideoTime >= currentSegmentData.endTime && !showQuiz) {
            youtubePlayerRef.current.pauseVideo();
            setIsPlaying(false);
            setShowQuiz(true);
          }
        }
      };

      const interval = setInterval(checkTime, 1000);
      return () => clearInterval(interval);
    } else if (!isYouTube) {
      const video = videoRef.current;
      if (!video) return;

      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        generateSegments(video.duration);
      };

      const handleTimeUpdate = () => {
        const currentVideoTime = video.currentTime;
        setCurrentTime(currentVideoTime);
        
        // Check if current segment is completed (2 minutes watched)
        const currentSegmentData = segments[currentSegment];
        if (currentSegmentData && currentVideoTime >= currentSegmentData.endTime && !showQuiz) {
          video.pause();
          setIsPlaying(false);
          setShowQuiz(true);
        }
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [segments, currentSegment, showQuiz, isYouTube, youtubeReady, isPlaying]);

  // Track actual watch time and update progress
  useEffect(() => {
    if (isPlaying && !showQuiz) {
      intervalRef.current = setInterval(() => {
        setActualWatchTime(prev => {
          const newWatchTime = prev + 1;
          // Update progress every minute
          if (newWatchTime % 60 === 0) {
            const minutesWatched = Math.floor(newWatchTime / 60);
            onProgress?.(minutesWatched);
            // Update user progress with watch time
            updateProgress(0, 1, 0); // 1 minute of study time
          }
          return newWatchTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, showQuiz, onProgress, updateProgress]);

  const handlePlay = () => {
    if (isYouTube && youtubePlayerRef.current) {
      youtubePlayerRef.current.playVideo();
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (isYouTube && youtubePlayerRef.current) {
      youtubePlayerRef.current.pauseVideo();
      setIsPlaying(false);
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleRewatch = () => {
    const currentSegmentData = segments[currentSegment];
    if (currentSegmentData) {
      if (isYouTube && youtubePlayerRef.current) {
        youtubePlayerRef.current.seekTo(currentSegmentData.startTime, true);
        youtubePlayerRef.current.playVideo();
      } else if (videoRef.current) {
        videoRef.current.currentTime = currentSegmentData.startTime;
        videoRef.current.play();
      }
      setShowQuiz(false);
      setShowQuizResult(false);
      setSelectedAnswer(null);
      setIsPlaying(true);
    }
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handlePictureInPicture = async () => {
    if (videoRef.current && !isYouTube) {
      if (!isPiP) {
        await videoRef.current.requestPictureInPicture();
        setIsPiP(true);
      } else {
        await document.exitPictureInPicture();
        setIsPiP(false);
      }
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showQuizResult) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) return;

    const currentSegmentData = segments[currentSegment];
    if (!currentSegmentData || !currentSegmentData.quiz) return;

    const correct = selectedAnswer === currentSegmentData.quiz.correct_answer;
    setIsCorrect(correct);
    setShowQuizResult(true);
    
    // Update problems answered count
    setTotalProblemsAnswered(prev => prev + 1);
    
    // Update user progress with problems solved and XP
    const xpEarned = correct ? 25 : 0; // 25 XP for correct answer
    updateProgress(1, 0, xpEarned);
    
    // Call the quiz complete callback
    onQuizComplete?.(correct ? 1 : 0, 1);
  };

  const handleNextSegment = () => {
    // Only proceed if answer is correct
    if (isCorrect) {
      setCompletedSegments(prev => new Set([...prev, currentSegment]));
      
      if (currentSegment < segments.length - 1) {
        setCurrentSegment(prev => prev + 1);
        const nextSegment = segments[currentSegment + 1];
        if (isYouTube && youtubePlayerRef.current) {
          youtubePlayerRef.current.seekTo(nextSegment.startTime, true);
          youtubePlayerRef.current.playVideo();
        } else if (videoRef.current) {
          videoRef.current.currentTime = nextSegment.startTime;
          videoRef.current.play();
        }
        setShowQuiz(false);
        setShowQuizResult(false);
        setSelectedAnswer(null);
        setIsPlaying(true);
      } else {
        // Video completed - award completion bonus
        updateProgress(0, 0, 200); // 200 XP bonus for completing entire video
        onComplete?.();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSegmentData = segments[currentSegment];

  return (
    <div className="space-y-4">
      <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`} ref={containerRef}>
        <div className="relative aspect-video bg-black">
          {isYouTube ? (
            <div id="youtube-player" className="w-full h-full"></div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full"
              controls={false}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white text-sm mb-2">
              <span>
                Segment {currentSegment + 1} of {segments.length}: {currentSegmentData?.title}
              </span>
              <div className="flex items-center space-x-4">
                <span>Watch time: {Math.floor(actualWatchTime / 60)}m {actualWatchTime % 60}s</span>
                <span>Problems solved: {totalProblemsAnswered}</span>
              </div>
            </div>
            
            {/* Progress bar for current segment */}
            {currentSegmentData && (
              <div className="mb-3 w-full h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, ((currentTime - currentSegmentData.startTime) / (currentSegmentData.endTime - currentSegmentData.startTime)) * 100)}%` 
                  }}
                />
              </div>
            )}

            {/* Video Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  <span className="ml-2">{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                
                <button
                  onClick={handleRewatch}
                  className="flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                  <RotateCcw size={16} />
                  <span className="ml-2">Rewatch</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                {!isYouTube && (
                  <button
                    onClick={handlePictureInPicture}
                    className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                    title="Picture in Picture"
                  >
                    <PictureInPicture size={16} />
                  </button>
                )}
                
                <button
                  onClick={handleFullscreen}
                  className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                <span>Segment: {currentSegmentData ? formatTime(currentSegmentData.endTime - currentSegmentData.startTime) : '0:00'}</span>
              </div>
              <div className="flex items-center">
                <Target size={16} className="mr-1" />
                <span>Problems: {totalProblemsAnswered}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Quiz Modal */}
      {showQuiz && currentSegmentData && currentSegmentData.quiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Brain className="inline-block mr-2 text-indigo-500" size={24} />
                AI-Generated Quiz - Segment {currentSegment + 1}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Question 1 of 1
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <Brain className="inline mr-2" size={16} />
                  This question was generated by AI based on the video content you just watched. 
                  You must answer correctly to proceed to the next segment.
                </p>
              </div>

              {quizLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Generating AI quiz...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentSegmentData.quiz.question}
                  </h4>
                  
                  <div className="space-y-2">
                    {currentSegmentData.quiz.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="quiz-answer"
                          value={optionIndex}
                          checked={selectedAnswer === optionIndex}
                          onChange={() => handleAnswerSelect(optionIndex)}
                          disabled={showQuizResult}
                          className="mr-3 text-indigo-600"
                        />
                        <span className={`${
                          showQuizResult
                            ? optionIndex === currentSegmentData.quiz.correct_answer
                              ? 'text-green-600 dark:text-green-400 font-medium'
                              : selectedAnswer === optionIndex
                                ? 'text-red-600 dark:text-red-400'
                                : darkMode ? 'text-gray-300' : 'text-gray-700'
                            : darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>

                  {showQuizResult && (
                    <div className={`p-3 rounded-lg ${
                      isCorrect 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-center mb-2">
                        {isCorrect ? (
                          <CheckCircle className="text-green-600 dark:text-green-400 mr-2" size={16} />
                        ) : (
                          <X className="text-red-600 dark:text-red-400 mr-2" size={16} />
                        )}
                        <span className={`text-sm font-medium ${
                          isCorrect 
                            ? 'text-green-800 dark:text-green-300'
                            : 'text-red-800 dark:text-red-300'
                        }`}>
                          {isCorrect ? 'Correct! +25 XP' : 'Incorrect'}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        isCorrect 
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {currentSegmentData.quiz.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleRewatch}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Rewatch Segment
              </button>
              
              <div className="space-x-3">
                {!showQuizResult ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={selectedAnswer === null || quizLoading}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    {!isCorrect && (
                      <button
                        onClick={() => {
                          setShowQuizResult(false);
                          setSelectedAnswer(null);
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Try Again
                      </button>
                    )}
                    
                    {isCorrect && (
                      <button
                        onClick={handleNextSegment}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center"
                      >
                        {currentSegment < segments.length - 1 ? 'Next Segment' : 'Complete Video'}
                        <Award size={16} className="ml-2" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;