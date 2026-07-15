import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    const token = req.cookies.jwt;
    if(!token){
        return res.status(401).json({ message: "Unauthorized- No token provided" });
    }
    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // here we should use the same "jwt secret" which we have used to create the token.
        
        
        if(!decoded || !decoded.userId){
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const user = await User.findById(decoded.userId).select("-password");
        // .findById is a mongoose method that finds a document by its _id field. It returns a single document that matches the given id. If no document is found, it returns null.
        // .select("-password") will exclude the password

        
        if(!user){
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        req.user = user;
        next();


    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
};