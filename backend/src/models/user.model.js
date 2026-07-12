import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email:{
            type: String,
            required: true,
            unique: true
        },
        fullName:{
            type: String,
            required: true,
        },
        password:{
            type: String,
            required: true,
            minlength: 6,
        },
        profilePicture: {
            type: String,
            default: "",
        }
    },
    {
        timestamps: true,
    }
);


// first parameter is the name of the collection in the database, second parameter is the schema to be used for that collection
// the user should be singular and capitalized, mongoose will automatically create a collection named "users" in the database

const User = mongoose.model("User", userSchema);

export default User;


// models are used to define the structure of the data that will be stored in the database, and also to create instances of that data. They are also used to define the methods that can be used to interact with the data.