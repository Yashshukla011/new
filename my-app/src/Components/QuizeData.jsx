import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1Ry2KzqPfN4M80Gu_iatdCiklRCJI3LQ",
  authDomain: "quize-ee617.firebaseapp.com",
  projectId: "quize-ee617",
  storageBucket: "quize-ee617.appspot.com",
  messagingSenderId: "448358194670",
  appId: "1:448358194670:web:a89c3a3c85a2faeaedc2ff",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const decodeHtml = (html) => {
  if (typeof document === "undefined") return html;
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const getBackupQuestions = () => [
  { question: "Which F1 driver has 7 world titles?", options: ["Senna", "Alonso", "Schumacher", "Prost"], correctAnswer: "Schumacher" },
  { question: "Which team does Max Verstappen drive for?", options: ["Ferrari", "Red Bull", "Mercedes", "McLaren"], correctAnswer: "Red Bull" },
  { question: "What is the capital of France?", options: ["Paris", "Berlin", "London", "Madrid"], correctAnswer: "Paris" },
  { question: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Saturn"], correctAnswer: "Mars" },
  { question: "Who won the FIFA World Cup in 2022?", options: ["France", "Argentina", "Brazil", "Germany"], correctAnswer: "Argentina" }
];

export const fetchQuizData = async () => {
  try {
    const res = await fetch("https://opentdb.com/api.php?amount=10&category=9&type=multiple");
    
    if (res.status === 429) return getBackupQuestions();

    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results.map((q) => ({
        question: decodeHtml(q.question),
        options: [...q.incorrect_answers, q.correct_answer]
          .map((opt) => decodeHtml(opt))
          .sort(() => Math.random() - 0.5),
        correctAnswer: decodeHtml(q.correct_answer),
      }));
    }
    return getBackupQuestions();
  } catch (err) {
    return getBackupQuestions();
  }
};