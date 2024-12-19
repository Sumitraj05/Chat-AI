import { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generatingAnswer]);

  async function generateAnswer(e) {
    e.preventDefault();
    if (!question.trim()) return;
    
    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion(""); // Clear input immediately after sending
    
    // Add user question to chat history
    setChatHistory(prev => [...prev, { type: 'question', content: currentQuestion }]);
    
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${
          import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT
        }`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question }] }],
        },
      });

      const aiResponse = response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setChatHistory(prev => [...prev, { type: 'answer', content: aiResponse }]);
      setAnswer(aiResponse);
    } catch (error) {
      console.log(error);
      setAnswer("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer(false);
  }

  return (
    <div className="fixed inset-0 bg-black text-gray-100">
      <div className="h-full max-w-4xl mx-auto flex flex-col p-3">
        {/* Fixed Header */}
        <header className="text-center py-4">
          <a href="https://github.com/Vishesh-Pandey/chat-ai" 
             target="_blank" 
             rel="noopener noreferrer"
             className="block">
            <h1 className="text-4xl font-bold text-yellow-500 hover:text-red-600 transition-colors">
              CodeShield
            </h1>
          </a>
        </header>

        {/* Scrollable Chat Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 rounded-lg bg-gray-800 shadow-lg p-4 hide-scrollbar"
        >
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="bg-gray-900 rounded-xl p-8 max-w-2xl">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Vulnerability Detection App👋</h2>
                <p className="text-gray-400 mb-4">
                  Detect and Secure Your Code with Ease
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-gray-700 p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">💡</span> Buffer Overflow
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">🔧</span> Cross-Site-Scripting XSS
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">📝</span> Stack Overflow
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">🤔</span> SQL Injection
                  </div>
                </div>
                <p className="text-gray-500 mt-6 text-sm">
                  Detect vulnerabilities, secure your future.
                </p>
              </div>
            </div>
          ) : (
            <>
              {chatHistory.map((chat, index) => (
                <div key={index} className={`mb-4 ${chat.type === 'question' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-[80%] p-3 rounded-lg overflow-auto hide-scrollbar ${chat.type === 'question' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-700 text-gray-100 rounded-bl-none'}`}>
                    <ReactMarkdown className="overflow-auto hide-scrollbar">{chat.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </>
          )}
          {generatingAnswer && (
            <div className="text-left">
              <div className="inline-block bg-gray-700 p-3 rounded-lg animate-pulse">
                Finding Vulnerabilities...
              </div>
            </div>
          )}
        </div>

        {/* Fixed Input Form */}
        <form onSubmit={generateAnswer} className="bg-gray-900 rounded-lg shadow-lg p-4">
          <div className="flex gap-2">
            <textarea
              required
              className="flex-1 border border-gray-500 rounded p-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none bg-gray-800 text-gray-100"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Paste your code here..."
              rows="2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  generateAnswer(e);
                }
              }}
            ></textarea>
            <button
              type="submit"
              className={`px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-blue-600 transition-colors ${generatingAnswer ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={generatingAnswer}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
