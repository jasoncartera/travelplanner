import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

const ratingSchema = mongoose.Schema({
    userId: {type: String, required: true},
    experienceId: { type: String, required: true}, // for refernece if we did ObjectID: "type: mongoose.Schema.Types.ObjectId, ref: 'Experience'" 
    rating: {type:mongoose.Number, required: true}
});

const Rating = mongoose.model("ratings", ratingSchema);

// CRUD Operations 

const createRating = async (userId, experienceId, rating) => {
    const newRating = new Rating({        
        userId: userId,
        experienceId: experienceId,
        rating: rating});
    return newRating.save();
}

const getRatingById = async (_id) => {
    const query = Rating.findById(_id);
    return query.exec();
}

const updateRating= async (_id, userId, experienceId, rating) => {
    let oldRatingObj = await Rating.findById(ObjectId(_id)).exec();
    let newRatingObj = await Rating.findByIdAndUpdate(ObjectId(_id), {
        userId: userId,
        experienceId: experienceId,
        rating: rating
    }, {returnDocument: 'after', strict: false});
    if (oldRatingObj != newRatingObj) return 1;
    return 0;
}

const deleteRatingById = async (_id) => {
    const result = await Rating.deleteOne({_id: _id});
    return result.deletedCount;
}

// Display all individual rating records tied to an experience
const getAllRatingsForExperience= async(experienceId) => {
    const query = Rating.find({experienceId:experienceId})
    return query.exec();
}

// Return average rating for an experience
const getAverageRatingForExperience= async(experienceId) => {
    const query = Rating.aggregate(
        [
            {
                $match: {experienceId: experienceId}
            },
            {
              $group:
                {
                  _id: "$experienceId", //can also set to null, not sure what's best
                  avgQuantity: { $avg: "$rating" }
                }
            }
          ]
    )
    return query.exec();
}

// Return rating by a user for an experience
const getUserRatingForExperience= async(experienceId, userId) => {
    const search = {experienceId: experienceId, userId:userId};
    const query = Rating.findOne(search)
    return query.exec();
}


export {createRating, getRatingById, updateRating, deleteRatingById, getAllRatingsForExperience, getAverageRatingForExperience, getUserRatingForExperience};
