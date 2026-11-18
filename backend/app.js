require("dotenv").config();
const express = require('express');
//const connectDB = require("./config/db");
const cors = require('cors');
const authRoutes = require("./routes/authRoutes")
const app = express();
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
 

//middleware
app.use(cors({
  origin:"http://localhost:5173"
}));

app.use(express.json());
//authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
//test route
app.get("/", (req, res)=>{
  res.send("Connect Chat Backend is running!");
});

module.exports = app;