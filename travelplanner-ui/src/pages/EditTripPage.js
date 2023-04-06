import React, { useState, useEffect, useCallback } from 'react';
import { callProtectedAPI } from '../utils/message.util';
import { useAuth0 } from "@auth0/auth0-react";
import Select from 'react-select';


export const EditTripPage = () => {
    const [tripTitle, setTripTitle] = useState('');
    const [tripId, setTripId] = useState('');
    const [userId, setUserId] = useState('');
    const [experienceList, setExperienceList] = useState([]);
    const [allExperiences, setAllExperiences] = useState('');
    const [experienceLength, setExperiencesLength] = useState();
    const [userTripList, setUserTripList] = useState('');
    const [userTripLength, setUserTripLength] = useState('');
    const { getAccessTokenSilently, user } = useAuth0();


    const editTrip = async () => {
        console.log("Editing trip")
        setUserId(user.sub); // Active logged in user
        let experienceArray = [];
        experienceList.forEach(ex => experienceArray.push(ex._id));

        const editTrip = { tripTitle, userId, experienceArray};
        const token = await getAccessTokenSilently();
        const config = {
            method: 'PUT',
            body: JSON.stringify(editTrip),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        }
        let route = `trips/${tripId}/edit`;
        const response = await callProtectedAPI(config, route)
        if (response.status === 200) {
            alert("Successfully edited the trip");
        } else {
            alert(`Failed to edit trip, status code ${response.status}`);
        }
    }

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


    const loadExperiences = useCallback(async () => {
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }
        let route = 'experiences'
        const response = await callProtectedAPI(config, route)
        if (response.status === 200) {
            setAllExperiences(response.data);
        } else {
            alert(`Failed to display the experience list, status code ${response.status}`);
        }

        setExperiencesLength(Object.keys(response.data).size);
    }, []);

    useEffect(() => {
        getUserTrips();
        loadExperiences();
    }, [userTripLength, getUserTrips, experienceLength, loadExperiences]);


    const handleSelectChange = async (id) => {
        const selectedTrip = userTripList.find(({_id}) => _id === id)
        setTripId(id)
        setTripTitle(selectedTrip.tripTitle);
        let selectEx = [];
        for (let exId of selectedTrip.experienceList) {
            for (let ex of allExperiences){
                if (ex._id === exId) {
                    selectEx.push(ex);
                }
            }
        }

        // Preload the multi-select with existing experiences
        setExperienceList(selectEx);
    }

    return (
        <div>
            <div className='page-header'>
                <h3>Edit Trip</h3>
            </div>
            <div className='profileForm'>
                <form className=''>
                    <div className="multi-select-form">
                        <select
                            name="trip-dropdown"
                            onChange={e => handleSelectChange(e.target.value)}>
                            <option value="">Select a trip</option>
                            {userTripList && userTripList.map((item, index) => {
                                return <option key={index} value={item._id}>{item.tripTitle}</option>
                            })}
                        </select>
                        <input className='input'
                            type="description"
                            placeholder="Enter trip title"
                            value={tripTitle}
                            onChange={e => setTripTitle(e.target.value)} />
                        <Select
                            className="multi-select"
                            isMulti
                            styles={{
                                control: base => ({
                                    ...base,
                                    border: "2px solid black",
                                    "border-radius": "0px",
                                    margin: "auto"
                                }),
                                valueContainer: base => ({
                                    ...base,
                                    width: "300px",
                                    margin: "auto"
                                }),
                                indicatorsContainer: base => ({
                                    ...base,
                                    margin: "auto",
                                })
                            }}
                            value={experienceList}
                            options={allExperiences}
                            getOptionLabel={(option) => option.experienceTitle}
                            getOptionValue={(option) => option._id}
                            onChange={setExperienceList}
                        >
                        </Select>
                    </div>
                    <button className='button'
                        type="button"
                        onClick={editTrip}
                    >Edit</button>
                </form>
            </div>
        </div>
    );
}

export default EditTripPage;