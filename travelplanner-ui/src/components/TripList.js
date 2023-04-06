import React from 'react';
import Trip from './Trip';

function TripList({ trips }) {
    return (
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                </tr>
            </thead>
            <tbody>
                {trips.map((trip, i) => 
                    <Trip 
                        trip={trip} 
                        key={i}
                    />)}
            </tbody>
        </table>
    );
}

export default TripList;