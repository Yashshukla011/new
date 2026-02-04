import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Quiz fetching logic
export const fetchQuizData = async () => {
  try {
    const res = await fetch("https://opentdb.com/api.php?amount=10&category=9&type=multiple");
    const data = await res.json();
    return data.results.map((q) => ({
      question: q.question,
      options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
      correctAnswer: q.correct_answer,
    }));
  } catch (err) {
    return [
      { question: "2 + 2?", options: ["3", "4", "5", "6"], correctAnswer: "4" }
    ];
  }
};