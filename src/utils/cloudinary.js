import {v2 as cloudinary} from "cloudinary"
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (newLocalPath, oldCloudinaryID = null) => {
    try {
        if (!newLocalPath) return null

        //delete previously uploaded photos
        if(oldCloudinaryID){
            await cloudinary.uploader.destroy(oldCloudinaryID);
        }

        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(newLocalPath, {
            resource_type: "auto",
            folder: 'employee_profile'
        });
        //file has been uplaoded successfully
        console.log("file is uploaded on cloudinary", response.url);
        return response.secure_url;
    } catch (error) {
        fs.unlinkSync(newLocalPath)  //remove the locally saved temporary file as the upload operation got failed
    }
}

const uploadMultipleFiles = async(localPathsArray) => {
    try {
        const uploadPromises = localPathsArray.map(localPath =>
            cloudinary.uploader.upload(localPath, {
                folder: 'employee_documents',
                resource_type: 'auto',
            })
        );

        const uploadResults = await Promise.all(uploadPromises);

        return uploadResults.map(file => file.secure_url);

    } catch(error){
        localPathsArray.forEach(path => fs.unlinkSync(path));
    }
}


export { uploadOnCloudinary, uploadMultipleFiles }