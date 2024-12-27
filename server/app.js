import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createClient } from "redis";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

const messageSchema = new mongoose.Schema({
    room: String,
    user: String,
    text: String,
    timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

async function startServer() {
    await redisClient.connect();
    await mongoose.connect(process.env.MONGODB_URI);

    io.on("connection", (socket) => {
        console.log("A user connected");

        socket.on("join room", (room) => {
            socket.join(room);
            console.log(`User joined room: ${room}`);
        });

        socket.on("chat message", async (msg) => {
            console.log("Message received:", msg);
            await redisClient.publish("chat messages", JSON.stringify(msg));

            const newMessage = new Message(msg);
            await newMessage.save();
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });

    const subscriber = redisClient.duplicate();
    await subscriber.connect();

    await subscriber.subscribe("chat messages", (message) => {
        const msg = JSON.parse(message);
        io.to(msg.room).emit("chat message", msg);
    });

    app.get("/messages/:room", async (req, res) => {
        try {
            const messages = await Message.find({ room: req.params.room })
                .sort("timestamp")
                .limit(50);
            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: "Error fetching messages" });
        }
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer().catch(console.error);
