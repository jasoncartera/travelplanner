import { useNavigate } from 'react-router-dom';
import React from 'react';

function Trip({ trip }) {
    let navigate = useNavigate();
    const routeTrip = () => {
        var path = `/trips/${trip._id}`
        navigate(path);
    }

    return (
        <tr>
            <td><span onClick={routeTrip} style={{cursor: 'pointer'}}>{trip.tripTitle}</span></td>
        </tr>
    );
}

export default Trip;