import * as ratings from './rating_model.mjs';
import express from 'express';
import dotenv from 'dotenv';
import { jwtCheck } from "../auth.mjs";

dotenv.config();

const ratingRouter = express.Router();

ratingRouter.post('/create', jwtCheck, (req, res) => {
    console.log("Received a POST request");
    ratings.createRating(req.auth.payload.sub, req.body.experienceID, req.body.rating)
    .then (rating => {
        res.json(rating);
    })
    .catch (error => {
        console.error(error);
        res.status(400).json({Error: 'Request failed'});
    })
});


ratingRouter.get('/:_id', (req, res) => {
    console.log("Received a GET request");
    ratings.getRatingById(req.params._id)
    .then (rating => {
        if (rating == null) {
            res.status(404).json({ Error: "Rating not found" });
        } else {
            res.json(rating);
        }
    })
    .catch (error => {
        console.error(error);
        res.status(400).json({ Error: 'Request failed'});
    })
});

ratingRouter.put('/:_id/edit', jwtCheck, (req, res) => {
    console.log("Received a PUT request");
    let recordsChanged = 0;
    ratings.getRatingById(req.params._id)
        .then(rating => {
            if (rating == null) {
                res.status(404).json({ Error: "Rating not found" });
            } else {
                if (req.auth.payload.sub === rating.userId) {
                    ratings.updateRating(
                        req.params._id,
                        req.auth.payload.sub,
                        req.body.experienceId,
                        req.body.rating)
                        .then(recordsChanged => {
                            if (recordsChanged === 1) {
                                res.json({
                                    _id: req.params._id,
                                    userId: req.auth.payload.sub,
                                    experienceId: req.body.experienceId,
                                    rating: req.body.rating
                                });
                                console.log('Rating updated');
                            } else {
                                res.status(404).json({ Error: 'Rating not found' });
                            }
                        })
                        .catch(error => {
                            console.error(error);
                            res.status(400).json({ Error: 'Request failed' });
                        })
                } else {
                    res.status(401).json({ Error: "User not authorized to edit" });
                }
            }
        })
        .catch(err => {
            console.log(err);
            res.status(err.status);
        });
});

ratingRouter.delete('/:_id', jwtCheck, (req, res) => {
    console.log('Received a DELETE request');
    ratings.getRatingById(req.params._id)
        .then(rating => {
            if (rating == null) {
                res.status(404).json({ Error: "Rating not found" });
            } else {
                if (req.auth.payload.sub === rating.userId) {
                    ratings.deleteRatingById(req.params._id)
                        .then(deletedCount => {
                            if (deletedCount === 1) {
                                console.log('Rating deleted');
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
                    res.status(401).json({ Error: "User not authorized to delete" });
                }
            }
        })
        .catch(err => {
            console.log(err);
            res.status(err.status);
        });
});

// All ratings for an experience
ratingRouter.get('/experience/:_id/all', (req,res) => {
    console.log('Received a GET all request');
    ratings.getAllRatingsForExperience(req.params._id)        
    .then(rating => {
        res.json(rating);
    })
    .catch(error => {
        console.error(error);
        res.status(400).json({ Error: 'Request failed' });
    })

});

// Average ratings for an experience
ratingRouter.get('/experience/:_id', (req,res) => {
    console.log('Received a GET average request');
    ratings.getAverageRatingForExperience(req.params._id) 
    .then(rating => {
        res.json(rating);
    })
    .catch(error => {
        console.error(error);
        res.status(400).json({ Error: 'Request failed' });
    })
});

// Individual user rating for an experience
ratingRouter.get('/experience/:_id/:_user', jwtCheck, (req,res) => {
    console.log('Received a GET user rating request');
    ratings.getUserRatingForExperience(req.params._id, req.params._user) 
    .then(rating => {
        if (rating == null) {
            res.status(404).json({ Error: "Rating not found" });
        } else {
            if (req.auth.payload.sub === rating.userId) {
                res.json(rating);
            }
            else {
                res.status(401).json({ Error: "User not authorized to view rating" });
            }
        }
    })
    .catch(error => {
        console.error(error);
        res.status(400).json({ Error: 'Request failed' });
    })
    
});

export {ratingRouter};