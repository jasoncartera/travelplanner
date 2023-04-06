import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { METERS_PER_MILE, COUNTRY_NAME_TO_ISO } from '../constants.mjs';
import dotenv from "dotenv";

dotenv.config();
const { BING_MAPS_API_KEY } = process.env;

const experienceSchema = mongoose.Schema({
    experienceTitle: { type: String, required: true },
    description: { type: String, required: true },
    // MongoDB coordinates convention is longitude, then latitude
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    imageUrls: { type: [String], required: true },
    avgRating: { type: mongoose.Decimal128, required: false }, // calculated field
    keywords: { type: [String], required: true },
    user: { type: String, required: true } // user who created the experience
});

const Experience = mongoose.model("experiences", experienceSchema);

// Experience CRUD operations
const createExperience = async (experienceTitle, description, location, imageUrls, avgRating, keywords, user) => {
    const keywordList = keywords.toString().split(",").map(item => item.trim());
    const experience = new Experience({
        experienceTitle: experienceTitle,
        description: description,
        location: location,
        imageUrls: imageUrls,
        avgRating: avgRating,
        keywords: keywordList,
        user: user
    });
    return experience.save();
}

const getExperienceById = async (_id) => {
    const query = Experience.findById(_id);
    return query.exec();
}

const getAllExperience = async () => {
    const query = Experience.find();
    return query.exec();
}

const getExperiencesByUser = async (userSub) => {
    const query = Experience.find({ user: userSub });
    return query.exec();
}

const getExperienceByKeyword = async (keyword) => {
    try {
        const res = await Experience.aggregate([
            {
                $search: {
                    index: 'keywords',
                    text: {
                        query: keyword,
                        path: 'keywords'
                    }
                }
            },
        ]);
        return res;
    } catch (error) {
        console.log("No results on keyword search...")
        throw error
    }
}


// https://www.mongodb.com/docs/manual/tutorial/geospatial-tutorial/#sorted-with--nearsphere
const getExperienceByCoordinates = async (mileRadius, pointCoordinates) => {
    const res = await Experience.find({
        location: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: pointCoordinates
                },
                $maxDistance: mileRadius * METERS_PER_MILE
            }
        }
    })
    return res;
}

const getExperienceByZipCode = async (mileRadius, zipCode, country) => {
    var countryISO = COUNTRY_NAME_TO_ISO[country];
    var bingZipCodeData = await fetch(`http://dev.virtualearth.net/REST/v1/Locations?countryRegion={${countryISO}}&postalCode={${Number(zipCode)}}&include=ciso2&key=${BING_MAPS_API_KEY}`);
    var resultsJson = await bingZipCodeData.json();
    var coordinates = resultsJson['resourceSets'][0]['resources'][0]['point']['coordinates'];

    // If a zip code does not exist in the user-specified country,
    // Bing Maps API will still return data for the nearest country with the zip code instead of erroring
    // We must manually provide the user an error if they provide an incompatible zip code and country pair
    // Detect incompatibility by comparing the ISO code of the Bing-returned coordinates with the user-inputted country's ISO code
    var coordinatesISO = resultsJson['resourceSets'][0]['resources'][0]['address']['countryRegionIso2'];

    if (countryISO !== coordinatesISO) {
        console.error(`Zip code ${zipCode} does not exist in ${country}`);
        const errorJson = '{"type":"/errors/incorrect-input", "status": 404, "detail": "Incompatible zip code and country combination"}'
        return JSON.parse(errorJson);
    }

    console.log(`${country}'s ISO code is ${countryISO} and its coordinates (lat, long) for ${zipCode} are ${coordinates[0]}, ${coordinates[1]}`)
    // MongoDB orders coordinates as [long, lat] instead of the usual [lat, long]
    const res = await getExperienceByCoordinates(mileRadius, [coordinates[1], coordinates[0]]);
    return res;
}


const getExperienceByCity = async (mileRadius, query) => {
    try {
        var bingCityData = await fetch(`http://dev.virtualearth.net/REST/v1/Locations/${query}?maxResults=10&key=${BING_MAPS_API_KEY}`);
        var resultsJson = await bingCityData.json();
        var coordinates = resultsJson['resourceSets'][0]['resources'][0]['point']['coordinates'];

        // MongoDB orders coordinates as [long, lat] instead of the usual [lat, long]
        const res = await getExperienceByCoordinates(mileRadius, [coordinates[1], coordinates[0]]);
        return res;
    } catch (error) {
        console.log("No search results..");
        throw error;
    }
}


const updateExperience = async (_id, experienceTitle, description, location, imageUrls, keywords, user) => {
    let oldExperienceObj = await Experience.findById(ObjectId(_id)).exec();
    let experienceObj = await Experience.findByIdAndUpdate(ObjectId(_id), {
        experienceTitle: experienceTitle,
        description: description,
        location: location,
        imageUrls: imageUrls,
        user: user,
        keywords: keywords
    }, { returnDocument: 'after', strict: false });
    if (oldExperienceObj != experienceObj) return 1;
    return 0;
}

const updateExperienceRating = async (_id, avgRating) => {
    const update = { avgRating: avgRating };
    let oldExperienceObj = await Experience.findById(ObjectId(_id)).exec();
    let newExperienceObj = await Experience.findOneAndUpdate(ObjectId(_id), update, { returnOriginal: false })
    if (oldExperienceObj != newExperienceObj) return 1;
    return 0;
}

const deleteExperienceById = async (_id) => {
    const result = await Experience.deleteOne({ _id: _id });
    return result.deletedCount;
}


const getExperienceAndRating = async (_id) => {
    const result = await Experience.aggregate([
        {
            $lookup: {
                from: 'ratings',
                localField: '_id',
                foreignField: 'experienceId',
                as: 'ratings'
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                averageRating: { $avg: '$ratings.rating' }
            }
        }
    ], (err, experiences) => {
        if (err) {
            console.log(err);
        } else {
            res.json(experiences);
        }
    });
}

const removeImageFromExperience = async (_id, imageUrl) => {
    console.log(`Removing image(s) ${imageUrl} from experience ${_id}`);
    try {
        await Experience.updateOne(
            { _id: _id }, 
            { $pull: { imageUrls: { $in: [imageUrl] } } },
            { upsert: false, multi: true}
        ).exec();
    } catch (error) {
        console.error("Unable to delete image");
        throw error;
    }
    const updatedExperience = await getExperienceById(_id);

    // Verify successful delete by checking that the deleted URL is not in the updated Experience document
    // If successful, send latest URLs back to frontend to update state
    if (updatedExperience.imageUrls.includes(imageUrl)) {
        throw new Error("Image not removed Experience document");
    } else {
        return updatedExperience.imageUrls;
    }
}

const addImageToExperience = async (_id, addedImageUrl) => {
    console.log(`Adding new image(s) ${addedImageUrl} to experience ${_id}`);
    await Experience.updateOne(
        { _id: _id },
        { $push: { imageUrls: { $each: addedImageUrl } } }
    ).exec();

    const updatedExperience = await getExperienceById(_id);

    // Verify successful upload by checking that all new image URLs are in the updated Experience document
    // If successful, send latest URLs back to frontend to update state
    if (addedImageUrl.every(url => updatedExperience.imageUrls.includes(url))) {
        return updatedExperience.imageUrls;
    } else {
        throw new Error("Unable to find added image in Experience document");
    }
}

export {
    createExperience, getExperienceById, getExperienceByKeyword, getExperienceByCoordinates,
    getExperienceByZipCode, getExperienceByCity, updateExperience, updateExperienceRating, deleteExperienceById, getAllExperience,
    getExperienceAndRating, getExperiencesByUser, removeImageFromExperience, addImageToExperience
};

