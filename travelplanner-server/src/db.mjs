import mongoose from 'mongoose';

const connectToDatabase = async(uri) => {
    mongoose.set('strictQuery', false);
    mongoose.connect(uri, {useNewUrlParser: true});
    const db = mongoose.connection;
    const collectionNames = db.once("open", async() => {
        console.log(`Connected to ${uri} using Mongoose`);
    })
};

export {connectToDatabase};