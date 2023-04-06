import React, { useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from 'react';
import { callProtectedAPI } from '../utils/message.util';
import TripList from '../components/TripList';

function TripsPage() {
    const [userTripList, setUserTripList] = useState([]);
    const [userTripLength, setUserTripLength] = useState();
    const { getAccessTokenSilently } = useAuth0();

    const getUserTrips = useCallback(async () => {
        const token = await getAccessTokenSilently();
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        }
        let route = 'trips';
        const response = await callProtectedAPI(config, route)
        setUserTripList(response.data);
        setUserTripLength(Object.keys(response.data).size);
    }, [getAccessTokenSilently]);

    useEffect(() => {
        getUserTrips();
    }, [userTripLength, getUserTrips]);

    return (
        <div className="homepage-container">
            <article>
                <h2 className="home-title">My Trips</h2>
                <TripList
                    trips={userTripList}
                />
            </article>
        </div>
    )
}

export default TripsPage;
