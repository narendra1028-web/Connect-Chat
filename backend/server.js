const http = require("http");
const { Server } = require("socket.io");
const User = require("./models/User");
const app = require("./app");
const connectDB = require("./config/db");
const socketAuth = require("./socket/socketMiddleware");
const {markMessageDelivered, markMessagesRead } = require("./controllers/messageController");
//create http server
const server = http.createServer(app);
//initialize socket.io
const io = new Server(server, {
    cors:{
        origin:"http://localhost:5173",
        methods:["GET", "POST"]
    }
});
const onlineUsers = new Map();
app.set("io", io);
io.use(socketAuth);
//socket connection
io.on("connection", async (socket) => {
    const userId = socket.userId.toString();

    console.log("User connected:", userId);

    // Join user's personal room
    socket.join(userId);
    socket.on("message_delivered", async ({ messageId }) => {
       console.log("Delivery aknowledgement received:", messageId);
       await markMessageDelivered(messageId, socket.userId);
    });  
    socket.on("messages_read", async ({ senderId }) => {
       await markMessagesRead(senderId, socket.userId);
    });
    // Track active connections
    const connectionCount = onlineUsers.get(userId) || 0;
    onlineUsers.set(userId, connectionCount + 1);

    // Mark user online
    if (connectionCount === 0) {
        await User.findByIdAndUpdate(userId, {
            isOnline: true
        });

        // Notify other connected users
        socket.broadcast.emit("user_online", { userId });
    }
    // Send currently online users to the newly connected user
    socket.emit("online_users", Array.from(onlineUsers.keys()));
    socket.on("disconnect", async () => {
        console.log("User disconnected:", userId);

        const count = onlineUsers.get(userId) || 0;

        if (count <= 1) {
            onlineUsers.delete(userId);

            await User.findByIdAndUpdate(userId, {
                isOnline: false,
                lastSeen: new Date()
            });

            socket.broadcast.emit("user_offline", { userId });
        } else {
            onlineUsers.set(userId, count - 1);
        }
    });
});
 
//start server
const PORT = process.env.PORT || 5000;
const startServer = async ()=>{
    await connectDB();
    server.listen(PORT, ()=>{
        console.log(`Server running on port ${PORT}`);
    });
};
startServer();