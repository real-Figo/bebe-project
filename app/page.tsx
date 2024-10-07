'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import wordData from './data/words.json';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

interface Word {
  spanish: string;
  english: string;
  meaning: string;
}

const normalizeSpanish = (text: string): string => {
  return text.toLowerCase()
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ü/g, 'u')
    .replace(/ñ/g, 'n');
};

export default function Home() {
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [hint, setHint] = useState('');
  const [showMeaning, setShowMeaning] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);

  useEffect(() => {
    // Shuffle the words array
    const shuffledWords = [...wordData].sort(() => Math.random() - 0.5);
    setWords(shuffledWords);
  }, []);

  const currentWord = words[currentWordIndex];

  const checkAnswer = () => {
    const normalizedInput = normalizeSpanish(userInput);
    const normalizedSpanish = normalizeSpanish(currentWord?.spanish);
    
    if (normalizedInput === normalizedSpanish) {
      const pointsEarned = hint === '' ? 3 : hint.length === 2 ? 2 : 1;
      setScore(score + pointsEarned);
      setFeedback(`¡Correcto! You earned ${pointsEarned} point${pointsEarned !== 1 ? 's' : ''}.`);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      nextWord();
    } else {
      setFeedback('Incorrect. Try again or use a hint.');
    }
  };

  const getHint = (type: 'first2' | 'scrambled') => {
    if (type === 'first2') {
      setHint(currentWord.spanish.slice(0, 2));
    } else {
      // Scramble the letters without using the spread operator
      setHint(currentWord.spanish.split('').sort(() => Math.random() - 0.5).join(''));
    }
  };

  const nextWord = () => {
    setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    setUserInput('');
    setHint('');
    setShowMeaning(false);
    setFeedback('');
    setRevealAnswer(false);
  };

  if (!currentWord) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex items-center justify-center">
      {showConfetti && <Confetti />}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Spanish Word Learning</h1>
        <p className="mb-4 text-xl text-center">Translate: <strong className="text-green-600">{currentWord.english}</strong></p>
        <div className="flex mb-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-grow border-2 border-blue-300 p-2 rounded-l focus:outline-none focus:border-blue-500"
            placeholder="Type the Spanish word"
          />
          <button onClick={checkAnswer} className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 transition duration-200">
            Check
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={() => getHint('first2')} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-200">
            First 2 Letters
          </button>
          <button onClick={() => getHint('scrambled')} className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition duration-200">
            Scrambled Letters
          </button>
          <button onClick={() => setShowMeaning(!showMeaning)} className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600 transition duration-200">
            {showMeaning ? 'Hide' : 'Show'} Meaning
          </button>
          <button onClick={() => setRevealAnswer(!revealAnswer)} className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-200">
            {revealAnswer ? 'Hide' : 'Reveal'} Answer
          </button>
        </div>
        {hint && <p className="mt-2 text-blue-600">Hint: {hint}</p>}
        {showMeaning && <p className="mt-2 italic text-gray-600">"{currentWord.meaning}"</p>}
        {revealAnswer && <p className="mt-2 font-bold text-red-600">Answer: {currentWord.spanish}</p>}
        {feedback && <p className="mt-2 font-bold text-center" style={{color: feedback.startsWith('¡Correcto!') ? 'green' : 'red'}}>{feedback}</p>}
        <p className="mt-4 text-xl text-center">Score: <span className="font-bold text-blue-600">{score}</span></p>
        <button onClick={nextWord} className="mt-4 bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600 transition duration-200 w-full">
          Next Word
        </button>
      </div>
    </div>
  );
}