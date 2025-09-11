import { v2 as cloudinary } from "cloudinary";


const deleteOldImage = async (url) => {
        try {
            // Remove Cloudinary base URL + version
            const parts = url.split("/");
            const fileName = parts.pop(); // e.g. user123.png
            const folderPath = parts.slice(7).join("/"); // keeps everything after /upload/
            const publicId = `${folderPath}/${fileName.split(".")[0]}`;

            await cloudinary.uploader.destroy(publicId);
            console.log("Old avatar deleted:", publicId);
        } catch (error) {
            console.log("Old Avatar Deletion Failed:", error?.message);
        }
};

export { deleteOldImage }