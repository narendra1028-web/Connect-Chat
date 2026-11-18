const jwt = require('jsonwebtoken');
const protect = (req, res, next)=>{
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                message:"Not authorized. No token provided."
            });
        }
        //extract token
        const token = authHeader.split(" ")[1];
        
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded JWT:", decoded);
        //store user id in request
        req.userId = decoded.id;
        console.log("User ID assigned:", req.userId);
        next();
    }catch(error){
        console.error("JWT error:", error.message);
        return res.status(401).json({
            message:"Invalid or expired token"
        });
    }
};
module.exports = protect;