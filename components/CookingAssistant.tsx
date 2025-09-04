import React, { useState, useEffect, useRef } from 'react';
import { ai } from '../services/geminiService';
import type { Chat } from "@google/genai";
import type { Recipe } from '../types';
import { Loader } from './Loader';

interface CookingAssistantProps {
  recipe: Recipe;
  onClose: () => void;
}

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export const CookingAssistant: React.FC<CookingAssistantProps> = ({ recipe, onClose }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const systemInstruction = `You are a helpful and friendly cooking assistant named 'Chef Gemini'. You are an expert on the following recipe.
        Recipe Name: ${recipe.recipeName}.
        Description: ${recipe.description}.
        Ingredients: ${recipe.ingredients.map(i => `${i.quantity} ${i.name}`).join(', ')}.
        Instructions: ${recipe.instructions.join(' ')}.
        Your role is to answer questions strictly related to this recipe, such as substitution ideas, technique clarifications, or cooking time adjustments. Be encouraging and clear in your responses. Keep answers concise. If asked about a topic not related to this recipe, politely decline and steer the conversation back to the current dish.`;
        
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
        });

        setChat(chatInstance);
        setHistory([{ role: 'model', text: `Hello! I'm Chef Gemini. How can I help you with the "${recipe.recipeName}" recipe?` }]);
    }, [recipe]);

    useEffect(() => {
        // Scroll to bottom of chat history when it updates
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
            setHistory(prev => [...prev, { role: 'model', text: '' }]); // Add placeholder for streaming

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
            setHistory(prev => [...prev, { role: 'model', text: 'Sorry, I had a little trouble in the kitchen. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
         <div className="fixed bottom-4 right-4 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col animate-[fadeInUp_0.3s_ease-out] z-50">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-gray-800">Cooking Assistant</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>
            
            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto h-80 space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                           <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && history[history.length - 1].role === 'user' && (
                     <div className="flex justify-start">
                        <div className="max-w-xs md:max-w-sm px-4 py-2 rounded-2xl bg-gray-200 text-gray-800">
                           <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                           </div>
                        </div>
                    </div>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask a question about the recipe..."
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-400">
                        {isLoading ? <Loader/> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>}
                    </button>
                </div>
            </form>
        </div>
    );
};
