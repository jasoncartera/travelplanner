import * as experiences from './experience_model.mjs';
import express from 'express';
import dotenv from 'dotenv';
import { jwtCheck } from "../auth.mjs";

dotenv.config();

const experienceRouter = express.Router();


experienceRouter.get('/', (req, res) => {
    console.log("Received GET request for all experiences");
    experiences.getAllExperience()
        .then(experiences => {
            res.json(experiences);
        })
        .catch(error => {
            console.log(error);
            res.status(400).json({ Errror: 'Request failed' });
        })
});

experienceRouter.get('/user', jwtCheck, (req, res) => {
    console.log("Received GET request for user experiences");
    experiences.getExperiencesByUser(req.auth.payload.sub)
        .then(experiences => {
            res.json(experiences);
        })
        .catch(error => {
            console.log(error);
            res.status(400).json({ Errror: 'Request failed' });
        })
});


experienceRouter.get('/search/location', async (req, res) => {
    console.log("Received a GET request for search");
    if (req.query.type === 'city') {
        try {
            const experience = await experiences.getExperienceByCity(req.query.radius, req.query.query)
            res.json(experience);
        } catch (error) {
            res.status(400).send({Error: 'Search request failed'});
        }
    } else {
        if (req.body.coordinates) {
            experiences.getExperienceByCoordinates(req.body.mileRadius, req.body.coordinates)
                .then(experience => {
                    res.json(experience);
                })
                .catch(error => {
                    console.error(error);
                    res.status(400).json({ Error: 'Request failed' });
                })
        } else {
            // zip codes are only unique within a country,
            // so country name is required to return the correct coordinates for the entered zip code
            experiences.getExperienceByZipCode(req.body.mileRadius, req.body.zipCode, req.body.countryName)
                .then(experience => {
                    res.json(experience);
                })
                .catch(error => {
                    console.error(error);
                    res.status(400).json({ Error: 'Request failed' });
                })
        }
    }
});


experienceRouter.get('/search/keyword', (req, res) => {
    console.log("Received a GET request");
    experiences.getExperienceByKeyword(req.query.keyword)
        .then(experience => {
            res.json(experience);
        })
        .catch(error => {
            console.error(error);
            res.status(400).json({ Error: 'Request failed' });
        })
});

// user sub value is unique to each user
// https://auth0.com/blog/introducing-oauth2-express-sdk-protecting-api-with-jwt/

experienceRouter.post('/create', jwtCheck, (req, res) => {
    console.log("Received a POST request");
    experiences.createExperience(req.body.experienceTitle,
        req.body.description,
        req.body.location,
        req.body.imageUrls,
        req.body.avgRating,
        req.body.keywords,
        req.auth.payload.sub)
        .then(experience => {
            res.json(experience);
        })
        .catch(error => {
            console.error(error);
            res.status(400).json({ Error: 'Request failed' });
        })
});

experienceRouter.get('/:_id', (req, res) => {
    console.log("Received a GET request");

    experiences.getExperienceById(req.params._id)
        .then(experience => {
            if (experience == null) {
                res.status(404).json({ Error: "Experience not found" });
            } else {
                res.json(experience);
            }
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ Error: 'Request failed' });
        })
});

//Update experience except for average rating
experienceRouter.put('/:_id/edit', jwtCheck, (req, res) => {
    console.log("Received a PUT request");
    let recordsChanged = 0;
    experiences.getExperienceById(req.params._id)
        .then(experience => {
            if (experience == null) {
                res.status(404).json({ Error: "Experience not found" });
            } else {
                if (req.auth.payload.sub === experience.user) {
                    experiences.updateExperience(
                        req.params._id,
                        req.body.experienceTitle,
                        req.body.description,
                        req.body.location,
                        req.body.imageUrls,
                        req.body.keywords,
                        req.auth.payload.sub)
                        .then(recordsChanged => {
                            if (recordsChanged === 1) {
                                res.json({
                                    _id: req.params._id,
                                    experienceTitle: req.body.experienceTitle,
                                    description: req.body.description,
                                    location: req.body.location,
                                    imageUrls: req.body.imageUrls,
                                    keywords: req.body.keywords,
                                    user: req.auth.payload.sub
                                });
                                console.log('Experience updated');
                            } else {
                                res.status(404).json({ Error: 'Experience not found' });
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

//Update experience average rating only
experienceRouter.put('/:_id/avgRating', jwtCheck, (req, res) => {
    console.log("Received a PUT request");
    let recordsChanged = 0;
    experiences.getExperienceById(req.params._id)
        .then(experience => {
            if (experience == null) {
                res.status(404).json({ Error: "Experience not found" });
            } else {
                experiences.updateExperienceRating(
                    req.params._id,
                    req.body.avgRating,)
                    .then(recordsChanged => {
                        if (recordsChanged === 1) {
                            res.json({
                                _id: req.params._id,
                                avgRating: req.body.avgRating,
                            });
                            console.log('Experience rating updated');
                        } else {
                            res.status(404).json({ Error: 'Experience not found' });
                        }
                    })
                    .catch(error => {
                        console.error(error);
                        res.status(400).json({ Error: 'Request failed' });
                    })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(err.status);
        });
});

experienceRouter.delete('/:_id', jwtCheck, (req, res) => {
    console.log('Received a DELETE request');
    experiences.getExperienceById(req.params._id)
        .then(experience => {
            if (experience == null) {
                res.status(404).json({ Error: "Experience not found" });
            } else {
                if (req.auth.payload.sub === experience.user) {
                    experiences.deleteExperienceById(req.params._id)
                        .then(deletedCount => {
                            if (deletedCount === 1) {
                                console.log('Experience deleted');
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

export { experienceRouter };