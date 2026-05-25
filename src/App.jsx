import { useState } from "react";

function App() {
  const [jobTitle, setJobTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateQuestions = async () => {
    if (!jobTitle.trim()) {
      setError("Please enter a job title.");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);

    try {
      const prompt = `
      You are an expert hiring manager.

      Generate 3 thoughtful and role-specific interview questions for a candidate applying as:
      "${jobTitle}"

      Return only the questions as a numbered list.
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const parsedQuestions = text
        .split("\n")
        .filter((q) => q.trim() !== "");

      setQuestions(parsedQuestions);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-2 text-center">
          AI Interview Question Generator
        </h1>

        <p className="text-slate-300 text-center mb-6">
          Generate role-specific interview questions using AI
        </p>

        <input
          type="text"
          placeholder="Enter job title..."
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-700 text-white outline-none mb-4"
        />

        <button
          onClick={generateQuestions}
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-4 rounded-xl font-semibold"
        >
          {loading ? "Generating..." : "Generate Questions"}
        </button>

        {error && (
          <p className="text-red-400 mt-4">{error}</p>
        )}

        <div className="mt-6 space-y-4">
          {questions.map((question, index) => (
            <div
              key={index}
              className="bg-slate-700 p-4 rounded-xl"
            >
              {question}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;