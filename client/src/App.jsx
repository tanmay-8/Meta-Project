import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

const App = () => {
    const [socket, setSocket] = useState(null);
    const [room, setRoom] = useState("");
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [isJoined, setIsJoined] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on("chat message", (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.off("chat message");
        };
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const joinRoom = async () => {
        if (socket && room && username) {
            socket.emit("join room", room);
            setIsJoined(true);

            // Fetch message history
            try {
                const response = await fetch(
                    `${SOCKET_SERVER_URL}/messages/${room}`
                );
                const history = await response.json();
                setMessages(history);
            } catch (error) {
                console.error("Error fetching message history:", error);
            }
        }
    };

    const sendMessage = () => {
        if (socket && message && room && username) {
            const newMessage = {
                room,
                user: username,
                text: message,
                timestamp: Date.now(),
            };
            socket.emit("chat message", newMessage);
            setMessage("");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 font-main">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Real-time Chat</CardTitle>
                </CardHeader>
                <CardContent>
                    {!isJoined ? (
                        <div className="space-y-4">
                            <Input
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <Input
                                type="text"
                                placeholder="Enter room name"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                            />
                            <Button onClick={joinRoom} className="w-full">
                                Join Room
                            </Button>
                        </div>
                    ) : (
                        <div className="h-96 overflow-y-auto space-y-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={msg._id || index}
                                    className={`p-2 rounded-lg ${
                                        msg.user === username
                                            ? "bg-blue-100 text-right"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    <p className="font-bold">{msg.user}</p>
                                    <p>{msg.text}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(
                                            msg.timestamp
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </CardContent>
                {isJoined && (
                    <CardFooter>
                        <div className="flex w-full space-x-2">
                            <Input
                                type="text"
                                placeholder="Type a message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === "Enter" && sendMessage()
                                }
                            />
                            <Button onClick={sendMessage}>Send</Button>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default App;
