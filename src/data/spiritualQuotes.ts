// Daily spiritual quotes for auto-generation when no spiritual notice is present
export const spiritualQuotes: string[] = [
  "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
  "The mind is everything. What you think you become. - Buddha",
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "In the middle of difficulty lies opportunity. - Albert Einstein",
  "Knowledge speaks, but wisdom listens. - Jimi Hendrix",
  "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
  "Be the change you wish to see in the world. - Mahatma Gandhi",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Excellence is not a skill, it's an attitude. - Ralph Marston",
  "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
  "The only impossible journey is the one you never begin. - Tony Robbins",
  "Education is not preparation for life; education is life itself. - John Dewey",
  "The roots of education are bitter, but the fruit is sweet. - Aristotle",
  "An investment in knowledge pays the best interest. - Benjamin Franklin",
  "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice. - Brian Herbert",
  "Live as if you were to die tomorrow. Learn as if you were to live forever. - Mahatma Gandhi",
  "The more that you read, the more things you will know. The more that you learn, the more places you'll go. - Dr. Seuss",
  "Intelligence plus character - that is the goal of true education. - Martin Luther King Jr.",
  "The purpose of education is to replace an empty mind with an open one. - Malcolm Forbes",
  "Learning is a treasure that will follow its owner everywhere. - Chinese Proverb",
  "The expert in anything was once a beginner. - Helen Hayes",
  "Do not wait to strike till the iron is hot; but make it hot by striking. - William Butler Yeats",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us. - Ralph Waldo Emerson",
  "Start where you are. Use what you have. Do what you can. - Arthur Ashe",
  "The journey of a thousand miles begins with one step. - Lao Tzu",
  "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The only limit to our realization of tomorrow is our doubts of today. - Franklin D. Roosevelt",
  "It does not matter how slowly you go as long as you do not stop. - Confucius",
];

// Get a quote based on the day of the year for consistency
export const getDailyQuote = (): string => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return spiritualQuotes[dayOfYear % spiritualQuotes.length];
};
