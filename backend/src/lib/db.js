import mongoose from 'mongoose';
import dotenv from "dotenv";

// dotenvenv is a zero-dependency module that loads environment variables from a .env file into process.env. This allows us to keep sensitive information, such as database connection strings, out of our codebase and instead store them in a separate file that is not committed to version control. By calling dotenv.config(), we ensure that the environment variables defined in the .env file are available for use in our application, including the MongoDB connection URI that we will use to connect to the database.

// dotenv.config() reads the .env file and loads the environment variables into process.env, making them accessible throughout the application. This is a common practice to manage configuration settings and sensitive information securely in Node.js applications.
dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};