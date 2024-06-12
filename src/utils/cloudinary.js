const cloudinary=require('cloudinary').v2;

const fs=require('fs');



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });


const uploadCloudinary=async (localFilePath)=>{
      try {
            if(!localFilePath)return null
            // upload file on cloudinary
        const response =   await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"})
        console.log("file is upload on cloudinary",response.url);
        return response

      } catch (error) {
            fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
            return null;
      }

    }
    module.exports=uploadCloudinary;