
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";



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

      // generating the jwt token
      generateToken(newUser._id,res);

      // saving the user to the db
      await newUser.save();

      // response msg
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
    // .findOne is a mongoose method that finds a single document that matches the given query. It returns the first document that matches the query. If no document is found, it returns null.

    if(!user){
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    // bcrypt.compare() returns a boolean indicating whether the provided password matches the hashed password stored in the database.
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // If the credentials are valid, we generate a JWT token for the user and send it back in the response. The token is typically stored in an HTTP-only cookie to enhance security.


    generateToken(user._id,res);
    // here we are passing the user._id as the payload. token will be created considering the user._id as the payload. 



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
  // To log out a user, we can simply clear the JWT token from the client's cookies by setting it to an empty string and setting its expiration time to 0. This effectively removes the token from the client's browser, preventing it from being used for authentication in future requests.
  try{
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path:"/",
      expires: new Date(0),
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
      const {profilePic} = req.body;
      const userId = req.user._id;

      if(!profilePic){
        return res.status(400).json({ message: "Profile picture is required" });
      }

      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      const updateFields = { profilePicture: uploadResponse.secure_url };
      if (fullName) updateFields.fullName = fullName;
      if (email) updateFields.email = email;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateFields,
        { new: true }
      ).select("-password");

      return res.status(200).json(updatedUser);
  }
  catch (error) {
    console.error("Error in updateProfile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// check