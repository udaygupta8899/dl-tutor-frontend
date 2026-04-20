"use client";
import { useState, useEffect, useRef } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate a unique session ID for the RAG memory
  useEffect(() => {
    setThreadId(crypto.randomUUID());
  }, []);

  // Auto-scroll to the latest message
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          thread_id: threadId
        }),
      });

      if (!response.ok) throw new Error("Backend connection failed");
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Error: Could not reach the Azure brain." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-black text-gray-100 items-center">
      <header className="w-full max-w-3xl p-6 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-xl font-mono font-bold text-blue-500">DL_TUTOR_v2</h1>
        <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-500/50">AZURE_LIVE</span>
      </header>

      <div className="flex-1 w-full max-w-3xl overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center mt-20 text-gray-500 font-mono">
            Ready to discuss Deep Learning. Ask me about CNNs, RNNs, or the Rand Index.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-900 border border-gray-800'}`}>
              <p className="text-sm leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-xs text-blue-400 animate-pulse font-mono">AGENT_THINKING...</div>}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-3xl p-6 bg-black">
        <div className="relative flex items-center">
          <input 
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button className="absolute right-3 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            ASK
          </button>
        </div>
      </form>
    </main>
  );
}