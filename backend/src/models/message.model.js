import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        receiverId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
        groupId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Group",
        },
        text:{
            type: String,
        },
        image:{
            type: String,
        },
    },    
    {
        timestamps:true
    }
);

// Ensure that either receiverId or groupId is specified
messageSchema.pre("validate", function (next) {
    if (!this.receiverId && !this.groupId) {
        next(new Error("A message must specify either a receiverId or a groupId."));
    } else {
        next();
    }
});

const Message = mongoose.model("Message",messageSchema);

export default Message;