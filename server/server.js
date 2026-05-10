import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

//create Express app and HTTP server
const app = express();
const server = http.createServer(app)

//Initialize socket.io server
export const io = new Server(server, {
    cors: {origin: "*"}
})

//store online users
export const userSocketMap = {}; //{userId: socketId}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("user connected", userId);

    if (userId) userSocketMap[userId] = socket.id;
        
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log("User disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
        
    });

    // CALL FEATURE SOCKET EVENTS
    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
        console.log("CALL FROM:", from, "TO:", userToCall);
        const receiverSocketId = userSocketMap[userToCall];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("incomingCall", {
                signal: signalData,
                from,
                name
            });
        } else {
            console.log("User not online");
        }
    });

    socket.on("callTimeout", ({ to }) => {
        io.to(userSocketMap[to]).emit("callTimeout");
    });

    socket.on("answerCall", ({ to, signal }) => {
        const receiverSocketId = userSocketMap[to];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("callAccepted", signal);
        }
    });

    socket.on("endCall", ({ to }) => {
        const receiverSocketId = userSocketMap[to];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("endCall"); 
        }
    });
});


//Middleware setup
app.use(express.json({limit: "4mb"}));
app.use(cors());

//route setup

app.use("/api/status", (req, res)=> res.send("server is live"));
app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

//connect to mongodb
await connectDB();

const PORT  = process.env.PORT || 5000;
server.listen(PORT, ()=> console.log("Server is running on PORT:" + PORT)
);

