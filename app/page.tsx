"use client";
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setThreadId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input, thread_id: threadId }),
      });

      if (!response.ok) throw new Error("Backend connection failed");
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "**⚠️ Error:** Connection failed. Check Azure logs." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-[#212121] text-[#ececec]">
      {/* Top Header */}
      <header className="p-4 flex justify-between items-center border-b border-white/10">
        <div className="font-semibold text-lg">DL Tutor v2</div>
        <div className="text-xs text-green-400 font-mono bg-green-400/10 px-2 py-1 rounded">PROXIED_SECURE</div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
          {messages.length === 0 && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl">🎓</div>
              <h2 className="text-2xl font-bold">How can I help you with Deep Learning?</h2>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] md:max-w-[80%] p-4 rounded-2xl shadow-sm ${
                m.role === 'user' 
                ? 'bg-[#2f2f2f] border border-white/5' 
                : 'bg-transparent'
              }`}>
                <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-4 text-sm text-gray-400 animate-pulse font-mono italic">
                Tutor is searching textbook...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Field (ChatGPT Style) */}
      <footer className="p-4 md:p-8 bg-[#212121]">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative group">
          <textarea
            rows={1}
            className="w-full bg-[#2f2f2f] border border-white/10 rounded-2xl py-4 pl-4 pr-14 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none transition-all"
            placeholder="Message DL Tutor..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button 
            type="submit"
            className="absolute right-3 bottom-3 p-2 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </button>
        </form>
        <p className="text-[10px] text-center mt-3 text-gray-500">
          DL Tutor can make mistakes. Verify important info with your Information Security professor.
        </p>
      </footer>
    </main>
  );
}