import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { callProtectedAPI } from '../utils/message.util';
import { useAuth0 } from "@auth0/auth0-react";
import '../App.css';

export const ViewTripPage = () => {
    const [trips, setTrips] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [experienceNames, setExperienceNames] = useState([]);
    const params = useParams()
    const tripId = params['tripId']
    const { getAccessTokenSilently, user } = useAuth0();

    useEffect(() => {
        async function loadTrip(_id) {
            const token = await getAccessTokenSilently();
            const config = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            }
            
            let route = `trips/${_id}`
            const response = await callProtectedAPI(config, route)
            if (response.status === 200) {
                console.log("Successfully displayed trip.");
            } else {
                alert(`Failed to display the trip, status code ${response.status}`);
            }
            setTrips(await response.data);
            setExperiences(await response.data.experienceList);
            setExperienceNames(await response.data.experienceNameList);
        }

        loadTrip(tripId);

      }, [tripId, getAccessTokenSilently, user]);

    const trip = trips
    if (trip.length === 0) { 
        return 
    }

    return (
        <div>
            <h1>{trip.tripTitle}</h1>
                <div>
                    {experiences.map((exp, i) => {
                        return (
                            <p key={i}><Link to={`../experiences/${exp}`}>{experienceNames[i]}</Link></p>
                        )
                    })}
                </div>
        </div>   
    )
}

export default ViewTripPage;
