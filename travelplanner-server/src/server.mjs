import express from "express";
import multer from 'multer'
import { connectToDatabase } from "./db.mjs";
import dotenv from "dotenv";

dotenv.config();

const { ATLAS_URI } = process.env;
const PORT = process.env.PORT || 8080;

if (!ATLAS_URI) {
    console.error("No ATLAS_URI environment variable has been defined in config.env");
    process.exit(1);
}

connectToDatabase(ATLAS_URI);

// routes
import { userRouter } from "./users/user_controller.mjs";
import { experienceRouter } from './experiences/experience_controller.mjs';
import { tripRouter } from "./trips/trip_controller.mjs";
import { imageRouter } from "./images/image_controller.mjs";
import { ratingRouter } from "./ratings/rating_controller.mjs";


// Express initialization and configuration
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

/*
    Citation for the following middleware:
    Date: 1/18/2023
    Adapted from: CORS on ExpressJS
    Source URL: https://enable-cors.org/server_expressjs.html
    Adapted from: Mithun Satheesh answer on Stack Overflow
    Sourece URL: https://stackoverflow.com/questions/18642828/origin-origin-is-not-allowed-by-access-control-allow-origin
*/

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH');
    next();
});

// Default route
app.get('/', (req, res) => {
    res.status(200).json({Message: "TravelPlanner!"});
});

// routes
app.use('/experiences', experienceRouter);
app.use('/trips', tripRouter);
app.use('/users', userRouter);
app.use('/images', imageRouter);
app.use('/ratings', ratingRouter);

// Error handling middleware for JWT parsing and multer file upload
// eg. InvalidTokenError
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // LIMIT_FILE_SIZE error has no defined error code
        return res.status(400).json(err.code);
    }
	else if (err) {
        const status = err.status || 500;
		res.status(status).json({ Error: err.message});
	}
});

// Listen to the App Engine-specified port, or 8080 otherwise
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});
