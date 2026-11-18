const jwt = require("jsonwebtoken");

const socketAuth = (socket, next) =>{
    try{
        const token = socket.handshake.auth.token;
        if(!token){
            return next(new Error("Authentication error: Token missing"));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    }catch(error){
        console.log("Socket authentication error:", error.message);
        next(new Error("Authentication error:Invalid token"));
    }
};
module.exports = socketAuth;