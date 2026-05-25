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

      The questions should:
      - assess communication
      - assess problem solving
      - assess practical experience

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

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();

      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const parsedQuestions = text
        .split("\n")
        .filter((q) => q.trim() !== "");

      setQuestions(parsedQuestions);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyQuestions = async () => {
    try {
      await navigator.clipboard.writeText(
        questions.join("\n")
      );

      alert("Questions copied successfully!");
    } catch (err) {
      alert("Failed to copy questions.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-2xl">

        <h1 className="text-4xl font-bold mb-2 text-center text-white">
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              generateQuestions();
            }
          }}
          className="w-full p-4 rounded-xl bg-slate-700 text-white outline-none mb-4"
        />

        <button
          onClick={generateQuestions}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-4 rounded-xl font-semibold disabled:opacity-50 text-white"
        >
          {loading ? (
            <span className="animate-pulse">
              Generating Questions...
            </span>
          ) : (
            "Generate Questions"
          )}
        </button>

        {error && (
          <div className="mt-4">
            <p className="text-red-400">{error}</p>

            <button
              onClick={generateQuestions}
              className="bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-lg mt-3 text-white"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {questions.map((question, index) => (
            <div
              key={index}
              className="bg-slate-700 p-4 rounded-xl text-white"
            >
              {question}
            </div>
          ))}
        </div>

        {questions.length > 0 && (
          <button
            onClick={copyQuestions}
            className="bg-green-600 hover:bg-green-700 transition px-4 py-3 rounded-xl mt-6 w-full text-white"
          >
            Copy Questions
          </button>
        )}
      </div>
    </div>
  );
}

export default App;