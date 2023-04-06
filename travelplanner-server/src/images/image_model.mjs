import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { IMAGE_BUCKET_NAME, GCP_PROJECT_NAME, GCS_OBJECT_URL } from '../constants.mjs';

// Standardize file name into web-friendly syntax with unique identifier (date)
const updateFileName = async (file) => {
    const fileName = path.parse(file).name; 
    const fileExt = path.parse(file).ext;
    const standardizedFileName = fileName.replace(/ /g, '_') + '_' + Date.now() + fileExt;
    console.log(`Changed file name ${fileName} to ${standardizedFileName}`);
    return standardizedFileName;
}

const uploadImage = async (uploadedFile) => {
    const { originalname, buffer } = uploadedFile;
    const destFile = await updateFileName(originalname);

    // Google Cloud Storage destination configuration
    const storage = new Storage();
    const bucketName = GCP_PROJECT_NAME + '-' + IMAGE_BUCKET_NAME;
    const imageBucket = storage.bucket(bucketName);
    const file = imageBucket.file(destFile);

    const stream = file.createWriteStream({
        metadata: {
            contentType: uploadedFile.mimetype
        },
        resumable: false
    });

    stream.on('error', function(err) {console.error(err)});
    stream.end(buffer, (console.log(`Uploaded ${destFile}`)));

    // standard bucket object URL format
    const imageGcsUrl = GCS_OBJECT_URL + '/' + destFile;
    return imageGcsUrl;
}

const deleteImage = async (imageUrl) => {
    const storage = new Storage();
    const bucketName = GCP_PROJECT_NAME + '-' + IMAGE_BUCKET_NAME;
    const gcsUrl = GCS_OBJECT_URL + '/';
    const fileName = imageUrl.split(gcsUrl)[1];
    await storage.bucket(bucketName).file(fileName).delete();
}

export { uploadImage, deleteImage };
