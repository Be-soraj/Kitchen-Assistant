import React, { useState, useEffect, useRef } from 'react';
import { ai } from '../services/geminiService';
import type { Chat } from "@google/genai";
import { Loader } from './Loader';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export const StudyHelper: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const systemInstruction = `You are a helpful and encouraging study buddy for a student. Your goal is to help users understand concepts, not just give them answers. Explain topics clearly, ask probing questions to check for understanding, and provide examples. Keep your tone positive and friendly. If asked for direct answers to homework, guide them through the process of finding the answer themselves.`;
        
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
        });

        setChat(chatInstance);
        setHistory([{ role: 'model', text: "Hello! I'm your Study Buddy. What topic would you like to explore today?" }]);
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chat || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: userInput };
        setHistory(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const responseStream = await chat.sendMessageStream({ message: userInput });
            
            let modelResponse = '';
            setHistory(prev => [...prev, { role: 'model', text: '' }]); 

            for await (const chunk of responseStream) {
                modelResponse += chunk.text;
                setHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1].text = modelResponse;
                    return newHistory;
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setHistory(prev => [...prev, { role: 'model', text: 'Sorry, I seem to be having a problem. Please try asking again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex-grow flex flex-col">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-2">Study Helper</h2>
                <p className="text-gray-500 mb-6">Your personal AI tutor for any subject.</p>
                
                <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto h-96 space-y-4 bg-gray-50 rounded-lg border">
                    {history.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                               <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                     {isLoading && history[history.length - 1].role === 'user' && (
                         <div className="flex justify-start">
                            <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-200 text-gray-800">
                               <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                               </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <form onSubmit={handleSubmit} className="mt-6">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="e.g., Explain photosynthesis..."
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-400">
                            {isLoading ? <Loader/> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
