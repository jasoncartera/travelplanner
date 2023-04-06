import * as trips from './trip_model.mjs';
import express from 'express';
import dotenv from 'dotenv';
import { jwtCheck } from '../auth.mjs';

dotenv.config();

const tripRouter = express.Router();

// Get all trips for a user
tripRouter.get('/', jwtCheck, (req, res) => {
    trips.findAllTrips(req.auth.payload.sub)
    .then(allTrips => {
        res.json(allTrips);
    })
    .catch(error => {
        console.log(error);
        res.status(400).json({Error: 'Request for all trips failed'});
    })
});

tripRouter.post('/create', jwtCheck, (req, res) => {
    console.log("Received a POST request");
    trips.createTrip(req.body.tripTitle, req.auth.payload.sub, req.body.experienceArray)
        .then(trip => {
            res.json(trip);
        })
        .catch(error => {
            console.error(error);
            res.status(400).json({ Error: 'Request failed' });
        })
});


tripRouter.get('/:_id', jwtCheck, (req, res) => {
    console.log("Received a GET request");
    trips.getTripById(req.params._id)
        .then(trip => {
            if (trip === null) {
                res.status(404).json({ Error: "Trip not found" });
            } else {
                if (trip.userId === req.auth.payload.sub) {
                    res.json(trip);
                } else {
                    res.status(401).json({ Error: "User not authorized view trip" })
                }
            }
        })
        .catch(error => {
            console.error(error);
            res.status(400).json({ Error: 'Request failed' });
        })
});

tripRouter.put('/:_id/edit', jwtCheck, (req, res) => {
    console.log("Received a PUT request");
    let recordsChanged = 0;
    trips.getTripById(req.params._id)
        .then(trip => {
            if (trip === null) {
                res.status(404).json({ Error: "Trip not found" });
            } else {
                if (req.auth.payload.sub === trip.userId) {
                    trips.updateTrip(req.params._id, req.body.tripTitle, req.body.userEmail, req.body.experienceArray)
                        .then(recordsChanged => {
                            if (recordsChanged === 1) {
                                res.json({
                                    _id: req.params._id,
                                    tripTitle: req.body.tripTitle,
                                    userEmail: req.body.userEmail,
                                    experienceList: req.body.experienceArray
                                });
                                console.log('Trip updated');
                            } else {
                                res.status(404).json({ Error: 'Trip not found' });
                            }
                        })
                        .catch(error => {
                            console.error(error);
                            res.status(400).json({ Error: 'Request failed' });
                        })
                } else {
                    res.status(401).json({ Error: "User not authorized to edit trip" });
                }
            }
        })
        .catch(err => {
            console.log(err);
            res.status(err.status);
        });
});

tripRouter.delete('/:_id', jwtCheck, (req, res) => {
    console.log('Received a DELETE request');
    trips.getTripById(req.params._id)
        .then(trip => {
            if (trip === null) {
                res.status(404).json({ Error: "Trip not found" });
            } else {
                if (req.auth.payload.sub === trip.userId) {
                    trips.deleteTripById(req.params._id)
                        .then(deletedCount => {
                            if (deletedCount === 1) {
                                console.log('Trip deleted');
                                res.status(204).send();
                            } else {
                                res.status(404).json({ Error: 'Resource not found' });
                            }
                        })
                        .catch(error => {
                            console.error(error);
                            res.send({ Error: 'Request failed' });
                        })
                } else {
                    res.status(401).json({ Error: "User not authorized to delete trip" });
                }
            }
        })
        .catch(err => {
            console.log(err);
            res.status(err.status);
        });
});

export { tripRouter };