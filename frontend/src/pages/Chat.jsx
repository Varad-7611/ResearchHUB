import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Loader2, Bot, User, Trash2, StopCircle } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const Chat = () => {
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const messagesEndRef = useRef(null);

    const fetchChats = async () => {
        try {
            const { data } = await api.get('/chats');
            setChats(data);
            if (data.length > 0 && !activeChat) {
                handleSelectChat(data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch chats', error);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSelectChat = async (id) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/chats/${id}`);
            setActiveChat(id);
            setMessages(data.messages);
        } catch (error) {
            toast.error('Failed to load chat');
        } finally {
            setLoading(false);
        }
    };

    const createNewChat = async () => {
        const title = prompt('Enter chat title:');
        if (!title) return;
        try {
            const { data } = await api.post('/chats', { chat_title: title });
            setChats([data, ...chats]);
            setActiveChat(data.id);
            setMessages([]);
        } catch (error) {
            toast.error('Failed to create chat');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || !activeChat || streaming) return;

        const userMsg = { sender: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setStreaming(true);

        try {
            const response = await fetch(`http://localhost:8000/chats/${activeChat}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: new URLSearchParams({ query: input }),
            });

            if (!response.ok) throw new Error('Chat failed');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botContent = '';

            setMessages(prev => [...prev, { sender: 'bot', content: '', timestamp: new Date() }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                botContent += chunk;

                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].content = botContent;
                    return newMsgs;
                });
            }
        } catch (error) {
            toast.error('Failed to get AI response');
        } finally {
            setStreaming(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-panel/30 glass-card overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold">Research Assistant</h3>
                        <p className="text-[10px] text-primary flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            Llama-3.3-70B Active
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={createNewChat}
                        className="p-2 hover:bg-white/10 rounded-lg text-secondary hover:text-white transition-all flex items-center gap-2 text-sm"
                    >
                        <Plus size={18} /> New Conversation
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={40} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare size={40} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Start a new research session</h3>
                        <p className="max-w-xs mx-auto text-sm">Ask anything about your uploaded documents or general research topics.</p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`
                flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-panel border border-white/10 text-primary'}
              `}>
                                {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>
                            <div className={`
                max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed
                ${msg.sender === 'user'
                                    ? 'bg-primary/20 border border-primary/20 rounded-tr-none'
                                    : 'bg-white/5 border border-white/5 rounded-tl-none text-gray-200'}
              `}>
                                {msg.content}
                                {msg.sender === 'bot' && i === messages.length - 1 && streaming && (
                                    <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-primary align-middle" />
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5 bg-panel/50">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        className="w-full glass-input pr-12 py-4 pl-6 text-sm"
                        placeholder={activeChat ? "Ask your research question..." : "Select a conversation to start chatting"}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={!activeChat || streaming}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || !activeChat || streaming}
                        className={`
              absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all
              ${input.trim() && activeChat && !streaming ? 'bg-primary text-white' : 'text-secondary bg-white/5'}
            `}
                    >
                        {streaming ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </form>
                <p className="text-[10px] text-secondary mt-3 text-center">
                    ResearchHUB AI may provide info from its training data if documents don't contain the answer.
                </p>
            </div>
        </div>
    );
};

export default Chat;
