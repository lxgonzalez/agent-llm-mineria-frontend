import { useState, useEffect, useRef } from "react";
import { Send, User, Bot } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function ChatPage() {
    const [messages, setMessages] = useState([
        { id: 1, text: "¡Hola! ¿En qué puedo ayudarte?", sender: "bot" },
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        // Agregar mensaje del usuario
        const userMessage = { id: messages.length + 1, text: input, sender: "user" };
        setMessages(prev => [...prev, userMessage]);
        setInput("");

        try {
            // Simular petición a tu endpoint
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: input,
                    session_id: "123"
                }),
            });

            const data = await response.json();
            
            // Agregar respuesta del bot
            const botMessage = { 
                id: messages.length + 2, 
                text: data.text.replace(/\n/g, "\n"), 
                sender: "bot" 
            };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            const errorMessage = { 
                id: messages.length + 2, 
                text: "Error al conectar con el servidor", 
                sender: "bot" 
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-200">
            <div className="flex flex-col flex-grow">
            <div className="flex-grow p-4 overflow-y-auto space-y-4 text-white max-h-[92vh]">
            {messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div 
                                className={`p-3 rounded-lg max-w-[70%] ${
                                    msg.sender === "user" 
                                        ? "bg-gray-500" 
                                        : "bg-sky-500"
                                } whitespace-pre-wrap`}
                            >
                                <div className="flex items-center gap-2">
                                    {msg.sender === "user" ? (
                                        <User size={16} />
                                    ) : (
                                        <Bot size={16} />
                                    )}
                                    <span>{msg.text}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-300 bg-white">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <Button onClick={sendMessage}>
                            <Send size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}