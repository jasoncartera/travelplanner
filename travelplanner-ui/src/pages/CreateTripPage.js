import React, { useState, useEffect, useCallback } from 'react';
import { callProtectedAPI } from '../utils/message.util';
import { useAuth0 } from "@auth0/auth0-react";
import Select from 'react-select';

export const CreateTripPage = () => {
    const [tripTitle, setTripTitle] = useState('');
    const [userId, setUserId] = useState('');
    const [allExperiences, setAllExperiences] = useState('');
    const [experienceList, setExperienceList] = useState([]);
    const [experienceLength, setExperiencesLength] = useState();
    const { getAccessTokenSilently, user } = useAuth0();


    const addTrip = async () => {
        console.log("Adding trip")
        setUserId(user.sub); // Active logged in user
        let experienceArray = [];
        experienceList.forEach(ex => experienceArray.push(ex._id));
        
        // Create the trip
        const newTrip = { tripTitle, userId, experienceArray};
        const token = await getAccessTokenSilently();
        const config = {
            method: 'POST',
            body: JSON.stringify(newTrip),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        }
        let route = 'trips/create';
        const response = await callProtectedAPI(config, route)
        if (response.status === 200) {
            alert("Successfully added the trip");
        } else {
            alert(`Failed to add trip, status code ${response.status}`);
        }
    }

    //TODO: Use this to make a drop down list to select experiences rather than entering id
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

        //setAllExperiences(response.data);
        setExperiencesLength(Object.keys(response.data).size);
    }, []);

    useEffect(() => {
        loadExperiences();
    }, [experienceLength, loadExperiences]);

    return (
        <div>
            <div className='page-header'>
                <h3>Create Trip</h3>
            </div>
            <div className='profileForm'>
                <form>
                    <div className="multi-select-form">
                        <input className="input"
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
                        onClick={addTrip}
                    >Add</button>
                </form>
            </div>
        </div>
    );
}



export default CreateTripPage;