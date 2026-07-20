import Group from "../models/group.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// Create a new group chat
export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const creatorId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    // Robust parsing of member IDs (handles arrays, comma-separated strings, or arrays containing comma-separated strings)
    let parsedMembers = [];
    if (Array.isArray(members)) {
      members.forEach((m) => {
        if (typeof m === "string") {
          parsedMembers.push(...m.split(",").map(id => id.trim()).filter(Boolean));
        } else if (m) {
          parsedMembers.push(m.toString());
        }
      });
    } else if (typeof members === "string") {
      parsedMembers = members.split(",").map(id => id.trim()).filter(Boolean);
    }

    const uniqueMembers = [...new Set(parsedMembers)].map(id => id.toString());
    
    // Creator is always a member
    const groupMembers = [creatorId.toString(), ...uniqueMembers];

    const newGroup = new Group({
      name: name.trim(),
      description: description || "",
      creator: creatorId,
      members: groupMembers,
    });

    await newGroup.save();

    // Populate members list to return complete details to the client
    const populatedGroup = await Group.findById(newGroup._id)
      .populate("members", "-password")
      .populate("creator", "-password");

    // Dynamic Room Join: Automatically join the socket room for all online members of this group
    const activeSockets = io.sockets.sockets;
    groupMembers.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId);
      if (socketId) {
        const memberSocket = activeSockets.get(socketId);
        if (memberSocket) {
          memberSocket.join(newGroup._id.toString());
        }
      }
    });

    // Notify all online group members about the new group creation
    io.to(newGroup._id.toString()).emit("groupCreated", populatedGroup);

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error in createGroup controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all groups the current user is a member of
export const getGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId })
      .populate("members", "-password")
      .populate("creator", "-password")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getGroups controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add members to an existing group
export const addGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { membersToAdd } = req.body;

    // Robust parsing of members to add
    let parsedMembersToAdd = [];
    if (Array.isArray(membersToAdd)) {
      membersToAdd.forEach((m) => {
        if (typeof m === "string") {
          parsedMembersToAdd.push(...m.split(",").map(id => id.trim()).filter(Boolean));
        } else if (m) {
          parsedMembersToAdd.push(m.toString());
        }
      });
    } else if (typeof membersToAdd === "string") {
      parsedMembersToAdd = membersToAdd.split(",").map(id => id.trim()).filter(Boolean);
    }

    if (parsedMembersToAdd.length === 0) {
      return res.status(400).json({ message: "No valid members specified to add" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Add unique members
    const currentMembers = group.members.map(m => m.toString());
    const newMembers = parsedMembersToAdd.filter(id => !currentMembers.includes(id.toString()));

    if (newMembers.length === 0) {
      return res.status(400).json({ message: "All specified users are already members" });
    }

    group.members.push(...newMembers);
    await group.save();

    const populatedGroup = await Group.findById(groupId)
      .populate("members", "-password")
      .populate("creator", "-password");

    // Join the newly added online users to the socket room
    const activeSockets = io.sockets.sockets;
    newMembers.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId.toString());
      if (socketId) {
        const memberSocket = activeSockets.get(socketId);
        if (memberSocket) {
          memberSocket.join(groupId.toString());
        }
      }
    });

    // Notify all members including the new ones
    io.to(groupId.toString()).emit("groupUpdated", populatedGroup);

    res.status(200).json(populatedGroup);
  } catch (error) {
    console.error("Error in addGroupMembers controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Leave a group
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id.toString();

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member
    const isMember = group.members.some(m => m.toString() === userId);
    if (!isMember) {
      return res.status(400).json({ message: "You are not a member of this group" });
    }

    // Remove user
    group.members = group.members.filter(m => m.toString() !== userId);

    // If the creator leaves and there are still members, assign creator to someone else
    if (group.creator.toString() === userId && group.members.length > 0) {
      group.creator = group.members[0];
    }

    // If no members are left, delete the group
    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      return res.status(200).json({ message: "Left group, and group has been deleted since no members remained" });
    }

    await group.save();

    const populatedGroup = await Group.findById(groupId)
      .populate("members", "-password")
      .populate("creator", "-password");

    // Remove the user's socket from the room if online
    const socketId = getReceiverSocketId(userId);
    if (socketId) {
      const userSocket = io.sockets.sockets.get(socketId);
      if (userSocket) {
        userSocket.leave(groupId.toString());
      }
    }

    // Notify remaining group members
    io.to(groupId.toString()).emit("groupUpdated", populatedGroup);

    res.status(200).json({ message: "Left group successfully", group: populatedGroup });
  } catch (error) {
    console.error("Error in leaveGroup controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
