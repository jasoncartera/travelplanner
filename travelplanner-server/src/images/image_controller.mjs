import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import * as images from './image_model.mjs';
import multer from 'multer'
import express from 'express';
import dotenv from 'dotenv';
import { jwtCheck } from "../auth.mjs";
import { MB_PER_KB, KB_PER_BYTE } from '../constants.mjs'
import { removeImageFromExperience, addImageToExperience } from '../experiences/experience_model.mjs';

dotenv.config();

const imageRouter = express.Router();
const storage = multer.memoryStorage();

// Must use a third-party package such as multer for form data, i.e. file uploads, to be accessible in the request body
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * MB_PER_KB * KB_PER_BYTE
    }
});

const createUploadPromises = (req) => {
    const numFiles = Object.keys(req.files).length;
    console.log(`Received a POST request for ${numFiles} images`);
    
    // Use Promise.all to await all uploadImage calls in order to obtain GCS bucket URLs for all files
    let promises = [];
    for (let i = 0; i < numFiles; i++) {
        const promise = images.uploadImage(req.files[i]);
        promises.push(promise);
    }
    return promises;
}

imageRouter.post('/', upload.array('file'), jwtCheck, async (req, res) => {
    const promises = createUploadPromises(req);

    try {
        const fileUrls = await Promise.all(promises);
        // Send array of image URLs to client for use in Experience GET request
        res.json({"URLs": fileUrls});
    } catch (error) {
        console.error(error);
        res.status(400).json({ Error: 'Request failed' });
    }
});

imageRouter.put('/', upload.any(), jwtCheck, async (req, res) => {
    console.log('Received a PUT request');
    const promises = createUploadPromises(req);

    try {
        const fileUrls = await Promise.all(promises);
        await addImageToExperience(req.body._id, fileUrls).then((updatedUrls) => {
            console.log(updatedUrls);
            res.json({"imageUrls": updatedUrls});
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ Error: 'Request failed' });
    }
});

imageRouter.delete('/', jwtCheck, async (req, res) => {
    console.log('Received a DELETE request');
    const imageUrl = req.body.imageUrl;

    try {
        await images.deleteImage(imageUrl);
        const expId = mongoose.Types.ObjectId(req.body.experienceId.trim())
        const updatedUrls = await removeImageFromExperience(expId, imageUrl);
        res.json({"imageUrls": updatedUrls});
    } catch (error) {
        console.error(error);
        res.status(400).json({ Error: 'Request failed' });
    }
});

export {imageRouter};
