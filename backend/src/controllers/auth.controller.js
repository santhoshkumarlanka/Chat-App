
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";


export const signup = async (req, res) => {

  const { fullName, email, password } = req.body;
  try{

    if(password.length < 6){
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if(!fullName||!email||!password){
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if(user){
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword
    });

    if(newUser){
      generateToken(newUser._id,res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        message: "User created successfully" 
      });
    }
    else{
      return res.status(500).json({ message: "Failed to create user" });
    } 
  }
  catch(error){
    console.error("Error in signup:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if(!user){
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    generateToken(user._id,res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture
    });
  }
  catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  try{
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    return res.status(200).json({ message: "Logged out successfully" });
  }
  catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const updateProfile = async (req, res) => {
  const { fullName, email, profilePicture } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }