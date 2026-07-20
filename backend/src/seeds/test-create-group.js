import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../lib/db.js";
import { createGroup } from "../controllers/group.controller.js";

dotenv.config();

const runTest = async () => {
  try {
    await connectDB();
    
    // We mock a user ID to simulate an authenticated request
    const mockUserId = new mongoose.Types.ObjectId();

    const mockReq = {
      body: {
        name: "Test Group 123",
        description: "Testing group creation",
        members: [] // empty members is fine for testing
      },
      user: {
        _id: mockUserId
      }
    };

    const mockRes = {
      status: (code) => {
        console.log("Response status:", code);
        return {
          json: (data) => {
            console.log("Response JSON:", JSON.stringify(data, null, 2));
          }
        };
      }
    };

    console.log("Running createGroup controller...");
    await createGroup(mockReq, mockRes);

  } catch (error) {
    console.error("Test execution failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

runTest();
