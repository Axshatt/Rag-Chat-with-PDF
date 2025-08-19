'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as React from 'react';

interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
}

interface IMessage {
  role: 'assistant' | 'user';
  content?: string;
  documents?: Doc[];
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = React.useState<string>('');
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  // Auto-scroll when new messages appear
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;

    // Push user message
    const userMessage: IMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage(''); // clear input

    try {
      const selectedFile = "myNewPDF.pdf"; // later make this dynamic

      const res = await fetch(
        `http://localhost:8000/chat?message=${encodeURIComponent(message)}&file=${encodeURIComponent(selectedFile)}`
      );

      const data = await res.json();
      console.log(data);


      // Push assistant message
      const assistantMessage: IMessage = {
        role: 'assistant',
        content: data?.message || 'No response',
        documents: data?.docs || [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error: Failed to fetch response.' },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
          >
            <div
              className={`max-w-xs rounded-lg px-4 py-2 shadow-md text-sm ${msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
                }`}
            >
              {msg.content}
              {msg.documents && msg.documents.length > 0 && (
                <div className="mt-2 text-xs text-gray-700">
                  <strong>Sources:</strong>
                  <ul className="list-disc ml-4">
                    {msg.documents.map((doc, j,) => (
                      <li key={j}>{doc.metadata?.source ?? 'Unknown'}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t flex gap-3">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && message.trim()) {
              handleSendChatMessage();
            }
          }}
          placeholder="Type your message here..."
        />
        <Button onClick={handleSendChatMessage} disabled={!message.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatComponent;
