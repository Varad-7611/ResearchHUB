import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Loader2, Bot, User, Trash2, StopCircle, MessageSquare, Trash, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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

    const fetchChats = async (selectFirst = true) => {
        try {
            const { data } = await api.get('/chats');
            setChats(data);
            if (selectFirst && data.length > 0 && !activeChat) {
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
            setMessages(data.messages || []);
        } catch (error) {
            toast.error('Failed to load chat');
        } finally {
            setLoading(false);
        }
    };

    const createNewChat = async (initialQuery = null) => {
        const title = initialQuery ? (initialQuery.substring(0, 30) + '...') : (prompt('Enter chat title:') || 'New Conversation');
        try {
            const { data } = await api.post('/chats', { chat_title: title });
            setChats(prev => [data, ...prev]);
            setActiveChat(data.id);
            setMessages([]);
            return data.id;
        } catch (error) {
            toast.error('Failed to create chat');
            return null;
        }
    };

    const handleDeleteChat = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this chat?')) return;

        try {
            await api.delete(`/chats/${id}`);
            setChats(prev => prev.filter(c => c.id !== id));
            if (activeChat === id) {
                setActiveChat(null);
                setMessages([]);
            }
            toast.success('Chat deleted');
        } catch (error) {
            toast.error('Failed to delete chat');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Code copied to clipboard!');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const query = input.trim();
        if (!query || streaming) return;

        let chatId = activeChat;

        // Auto-create chat if none active
        if (!chatId) {
            chatId = await createNewChat(query);
            if (!chatId) return;
        }

        const userMsg = { sender: 'user', content: query, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setStreaming(true);

        // Add an initial empty bot message to show the loading animation immediately
        const botMsgIndex = messages.length + 1;
        setMessages(prev => [...prev, { sender: 'bot', content: '', timestamp: new Date() }]);

        try {
            const response = await fetch(`http://localhost:8000/chats/${chatId}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: new URLSearchParams({ query }),
            });

            if (!response.ok) throw new Error('Chat failed');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botContent = '';

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
            // Remove the empty bot message on error if it's still empty
            setMessages(prev => {
                if (prev[prev.length - 1].content === '') {
                    return prev.slice(0, -1);
                }
                return prev;
            });
        } finally {
            setStreaming(false);
        }
    };

    return (
        <div className="flex bg-panel/50 glass-card overflow-hidden h-[calc(100vh-4rem)] rounded-2xl border border-white/5 shadow-2xl">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r border-white/5 bg-white/5 flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <button
                        onClick={() => { setActiveChat(null); setMessages([]); }}
                        className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={18} /> New Chat
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {chats.map((chat) => (
                        <div key={chat.id} className="relative group/chat">
                            <button
                                onClick={() => handleSelectChat(chat.id)}
                                className={`w-full p-4 rounded-xl text-left transition-all relative border pr-12 ${activeChat === chat.id
                                    ? 'bg-primary/20 border-primary/30 text-white'
                                    : 'bg-white/5 border-transparent text-secondary hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <MessageSquare size={18} className={activeChat === chat.id ? 'text-primary' : 'text-secondary'} />
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium truncate">{chat.chat_title}</p>
                                        <p className="text-[10px] opacity-50 mt-1">{new Date(chat.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </button>
                            <button
                                onClick={(e) => handleDeleteChat(e, chat.id)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-secondary hover:text-red-400 opacity-0 group-hover/chat:opacity-100 transition-opacity"
                                title="Delete chat"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-panel/30 relative">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Research Assistant</h3>
                            <p className="text-[10px] text-primary flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                Llama-3.3-70B Active
                            </p>
                        </div>
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
                                <Bot size={40} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">How can I help you today?</h3>
                            <p className="max-w-xs mx-auto text-sm">Ask about your documents or start a general research discussion.</p>
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
                                    {msg.sender === 'user' ? (
                                        msg.content
                                    ) : (
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            {msg.content === '' && streaming ? (
                                                <div className="flex gap-1 items-center h-5">
                                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce-subtle [animation-delay:-0.3s]" />
                                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce-subtle [animation-delay:-0.15s]" />
                                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce-subtle" />
                                                </div>
                                            ) : (
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code({ node, inline, className, children, ...props }) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            const codeContent = String(children).replace(/\n$/, '');

                                                            return !inline && match ? (
                                                                <div className="relative group/code my-4">
                                                                    <div className="absolute right-2 top-2 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={() => copyToClipboard(codeContent)}
                                                                            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 text-white/70 hover:text-white transition-all"
                                                                            title="Copy code"
                                                                        >
                                                                            <Copy size={14} />
                                                                        </button>
                                                                    </div>
                                                                    <SyntaxHighlighter
                                                                        style={vscDarkPlus}
                                                                        language={match[1]}
                                                                        PreTag="div"
                                                                        className="rounded-xl border border-white/10 !bg-[#1e1e1e]/50 !m-0"
                                                                        {...props}
                                                                    >
                                                                        {codeContent}
                                                                    </SyntaxHighlighter>
                                                                </div>
                                                            ) : (
                                                                <code className={`${className} bg-white/10 px-1.5 py-0.5 rounded text-primary-light`} {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                        a({ node, children, ...props }) {
                                                            return (
                                                                <a {...props} target="_blank" rel="noopener noreferrer">
                                                                    {children}
                                                                </a>
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            )}
                                        </div>
                                    )}
                                    {msg.sender === 'bot' && i === messages.length - 1 && streaming && msg.content !== '' && (
                                        <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-primary align-middle" />
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-white/5 bg-panel/50 relative z-10">
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            type="text"
                            autoFocus
                            className="w-full glass-input pr-12 py-4 pl-6 text-sm text-white bg-white/5 focus:bg-white/10"
                            placeholder="Type your message here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={streaming}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || streaming}
                            className={`
                                absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all z-20
                                ${input.trim() && !streaming ? 'bg-primary text-white' : 'text-secondary bg-white/5'}
                            `}
                        >
                            {streaming ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        </button>
                    </form>
                    <p className="text-[10px] text-secondary mt-3 text-center">
                        ResearchHUB AI will search your documents first, or fallback to web search if needed.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Chat;
