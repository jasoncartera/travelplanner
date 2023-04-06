import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { getExperienceById } from '../experiences/experience_model.mjs';

// trip ID, trip title, user ID, list of experiences
const tripSchema = mongoose.Schema({
    tripTitle: { type: String, required: true },
    userId: { type: String, required: true }, //userId from OAuth
    experienceList: { type: [ObjectId], required: false }, // https://mongoosejs.com/docs/schematypes.html#arrays
    experienceNameList: { type: [String], required: false }
});

const Trip = mongoose.model("trips", tripSchema);

// Trip CRUD operations

// Retrieve each experience's name to store in the Trip document for easy retrieval/display
// instead of constantly querying the database for experience name
const createExperiencesArray = async (experienceId) => {
    const expId = mongoose.Types.ObjectId(experienceId.trim());
    let experience = await getExperienceById(expId);
    return [expId, experience.experienceTitle];
}

const createTrip = async (tripTitle, userId, experienceList) => {
    // an empty list of experiences has a length of 1: transmitted as ['']
    if (experienceList.length >= 1) {
        console.log('in exp lst');
        console.log(experienceList.length);
        var promises = [];
        for (let i = 0; i < experienceList.length; i++) {
            const promise = createExperiencesArray(experienceList[i]);
            promises.push(promise);
        }

        Promise.all(promises).then(expList => {
            let experienceIdList = [];
            let experienceNameList = []
            for (let i = 0; i < expList.length; i++) {
                experienceIdList.push(expList[i][0]);
                experienceNameList.push(expList[i][1]);
            }
            const trip = new Trip({
                tripTitle: tripTitle,
                userId: userId,
                experienceList: experienceIdList,
                experienceNameList: experienceNameList
            });
            return trip.save();
        })
    } else {
        console.log('no experience list');
        const trip = new Trip({
            tripTitle: tripTitle,
            userId: userId
        });
        return trip.save();
    }
}

const getTripById = async (_id) => {
    const query = Trip.findById(_id);
    return query.exec();
}

// TODO: Herakles, mirror updated createTrip above which now includes experience name
const updateTrip = async (_id, tripTitle, userId, experienceList) => {
    if (experienceList) {
        let exArray = []
        for (let i = 0; i < experienceList.length; i++) {
            exArray.push(await createExperiencesArray(experienceList[i]));
        };
        let experienceIdList = [];
        let experienceNameList = []
        for (let i = 0; i < exArray.length; i++) {
            experienceIdList.push(exArray[i][0]);
            experienceNameList.push(exArray[i][1]);
        }
        let oldTripObj = await Trip.findById(ObjectId(_id)).exec();
        let newTripObj = await Trip.findByIdAndUpdate(ObjectId(_id), {
            tripTitle: tripTitle,
            userId: userId,
            experienceList: experienceIdList,
            experienceNameList: experienceNameList
        }, { returnDocument: 'after', strict: false });
        if (oldTripObj != newTripObj) return 1;
        return 0;
    } else {
        let oldTripObj = await Trip.findById(ObjectId(_id)).exec();
        let newTripObj = await Trip.findByIdAndUpdate(ObjectId(_id), {
            tripTitle: tripTitle,
            userId: userId,
        }, { returnDocument: 'after', strict: false });
        if (oldTripObj != newTripObj) return 1;
        return 0;
    }
}

const deleteTripById = async (_id) => {
    const result = await Trip.deleteOne({ _id: _id });
    return result.deletedCount;
}

// TODO: Find all trips
// https://masteringjs.io/tutorials/mongoose/find-all
// https://mongoosejs.com/docs/api.html#model_Model-find

const findAllTrips = async (userId) => {
    const query = Trip.find({ userId: userId });
    return query.exec();
}

export { createTrip, getTripById, updateTrip, deleteTripById, findAllTrips };
