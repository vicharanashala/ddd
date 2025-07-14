/*
  # Add video_url to courses table

  1. Changes
    - Add video_url column to courses table for storing course video links
    - Update existing courses with sample video URLs
*/

-- Add video_url column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS video_url text;

-- Update existing courses with sample video URLs
UPDATE courses SET video_url = CASE 
  WHEN title = 'Data Structures Masterclass' THEN 'https://www.youtube.com/embed/RBSGKlAvoiM'
  WHEN title = 'System Design Interview Prep' THEN 'https://www.youtube.com/embed/UzLMhqg3_Wc'
  WHEN title = 'Dynamic Programming Deep Dive' THEN 'https://www.youtube.com/embed/oBt53YbR9Kk'
  WHEN title = 'Database Design Fundamentals' THEN 'https://www.youtube.com/embed/ztHopE5Wnpc'
  WHEN title = 'Frontend Development Bootcamp' THEN 'https://www.youtube.com/embed/Tn6-PIqc4UM'
  WHEN title = 'Complete Web Development Bootcamp' THEN 'https://www.youtube.com/embed/UB1O30fR-EE'
  WHEN title = 'AI & Machine Learning Fundamentals' THEN 'https://www.youtube.com/embed/_uQrJ0TkZlc'
  WHEN title = 'Data Science with Python' THEN 'https://www.youtube.com/embed/r-uOLxNrNk8'
  WHEN title = 'Mobile App Development with React Native' THEN 'https://www.youtube.com/embed/0-S5a0eXPoc'
  WHEN title = 'DevOps and Cloud Computing' THEN 'https://www.youtube.com/embed/Pg_tCm0DGsg'
  ELSE 'https://www.youtube.com/embed/UB1O30fR-EE'
END
WHERE video_url IS NULL;