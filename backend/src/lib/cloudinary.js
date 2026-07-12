import {v2 as cloudinary} from "cloudinary";

import {config} from "dotenv";  
// config is a function that reads the .env file and loads the environment variables into process.env. This allows us to access the Cloudinary credentials securely without hardcoding them in our codebase. By calling config(), we ensure that the environment variables are available for use when configuring the Cloudinary instance.

config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;


// this file is responsible for configuring the Cloudinary instance with the necessary credentials. It imports the Cloudinary library and the dotenv package to load environment variables from the .env file. The cloudinary.config() method is called with the credentials to set up the Cloudinary instance, which can then be used throughout the application to manage and deliver media assets. Finally, the configured Cloudinary instance is exported for use in other parts of the application.