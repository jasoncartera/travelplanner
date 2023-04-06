import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { callProtectedAPI } from '../utils/message.util';
import { useAuth0 } from "@auth0/auth0-react";
import '../App.css';
import Stars from '../utils/starOnly';
import StarRating from '../utils/starRating';

export const ViewExperiencePage = () => {
    const [experiences, setExperiences] = useState([]);
    const [userRating, setRating] = useState([]);
    const [images, setImages] = useState([]);
    const params = useParams()
    const experienceId = params['experienceId']
    const { getAccessTokenSilently, user } = useAuth0();

    useEffect(() => {
        async function loadExperience(_id) {
            const config = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
            
            let route = `experiences/${_id}`
            const response = await callProtectedAPI(config, route)
            if (response.status === 200) {
                console.log("Successfully displayed experience.");
            } else {
                alert(`Failed to display the experience, status code ${response.status}`);
            }
            setExperiences(await response.data);
            setImages(await response.data.imageUrls);
        }
        
        async function loadUserRating(expId) {
            if (user == null) {
                console.log("No user ID returned")
                setRating(null) // Set rating to null if user ID not found
                return
            }
            
            const userId = user.sub

            console.log(`User exists: ${userId}`)

            const token = await getAccessTokenSilently();
             
            let config = {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            }
            let route = `ratings/experience/${expId}/${userId}`
            console.log("ROUTE", route)
            const response = await callProtectedAPI(config, route)
            if (response.status === 200) {
                console.log("Successfully retrieved user rating");
            } else if (response.status === 404) {
                console.log("User rating does not exist for current experience")
                setRating(0) // Set rating to 0 if user ID found but no rating for this experience
            } else {
                alert(`Failed to retrieve user rating, status code ${response.status}`);
            }
    
            setRating(await response.data);
        }

        loadExperience(experienceId);
        loadUserRating(experienceId);

      }, [experienceId, getAccessTokenSilently, user]);

    const experience = experiences
    let avgRating;
    //I don't know why but this page won't wait for the data to return before attempting to render unless this conditional is put in
    if (experience.length === 0 ) { 
        avgRating = 0
        return 
    }
    else {
        avgRating = experience.avgRating["$numberDecimal"]
    }
    

    let rating = userRating
    let userRatingDisplay = ''

    if (rating !== null) { //conditionally render user rating if user is logged in
        console.log(`User rating ID ${userRating._id}`)
        if (!userRating.rating) {
            userRatingDisplay = <p>Your rating: <StarRating initialRating={0} experienceId={experienceId} /> </p>
        } else {
            userRatingDisplay = <p>Your rating: <StarRating initialRating={userRating.rating} experienceId={experienceId} initialId={userRating._id}/> </p>

        }
    } 

    return (
        <div>
            <h1>View Experience</h1>
                <div>
                <h3>{experience.experienceTitle}</h3>
                <h4>Image Gallery</h4>
                <div className='image-gallery'>
                    {images.map((img, i) => {
                        return (
                        <div key={i}>
                            <img className='img' src={img} alt={img}/>
                        </div>
                        );
                    })}
                </div>
                <p>{experience.description}</p>
                <p>Latitude: {experience.location['coordinates'][1]} , Longitude: {experience.location['coordinates'][0]} </p>
                <p>Average Rating:<Stars highlight={avgRating} /></p>
                <p>{userRatingDisplay} </p>
                <p>Keywords: {experience.keywords.filter((item) => {
                    return(
                        item
                    ) } ).join(', ')}</p>
                </div>
        </div>   
    )
}

export default ViewExperiencePage;
