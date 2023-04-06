import React, { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { callProtectedAPI } from '../utils/message.util';
import ExperienceList from "../components/ExperienceList";

function Home() {
    const [query, setQuery] = useState("")
    const [mileRadius, setMileRadius] = useState(15);
    const [keyword, setKeyword] = useState("");
    const [experiences, setExperiences] = useState([]);
    const [experienceLength, setExperiencesLength] = useState();
    const { getAccessTokenSilently } = useAuth0();

    const manageExperienceResonse = (data, status) => {
        if (status === 200) {
            setExperiences(data);
            setExperiencesLength(Object.keys(data).size);
            console.log("Successfully displayed experience list.");
        } else {
            console.log(`Error: ${data["Error"]}, status: ${status}`);
        }
    }
    const loadExperiences = useCallback(async () => {
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }
        const queryRoute = `experiences/search/location?type=city&query=${query}&radius=${mileRadius}`;
        const route = 'experiences'

        try {
            if (query) {
                const response = await callProtectedAPI(config, queryRoute);
                manageExperienceResonse(response.data, response.status)
            } else {
                const response = await callProtectedAPI(config, route)
                manageExperienceResonse(response.data, response.status)
            }
        } catch (error) {
            alert(`Failed to display the experience list, status code ${error}`);
        }

    }, [query, mileRadius]);

    const onDeleteExperience = async experienceId => {
        const token = await getAccessTokenSilently();
        const config = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        }
        let route = `experiences/${experienceId}`;
        const response = await callProtectedAPI(config, route);
        if (response.status === 204) {
            loadExperiences();
            getExpRatings(experienceId)
            console.log(`Deleted experience id: ${experienceId}`)
        } else {
            alert(`Failed to delete the experience, status code ${response.status}`);
        }
    }

    const getExpRatings = async experienceId => {
        const token = await getAccessTokenSilently();
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        }
        let route = `ratings/experience/${experienceId}/all`
        const response = await callProtectedAPI(config, route);
        if (response.status === 200) {
            console.log(`Loaded ratings for: ${experienceId}`)
        } else {
            alert(`Failed to load ratings for experience, status code ${response.status}`);
            return
        }
        //console.log(`Load ratings response: ${JSON.stringify(response.data)}`)
        let ratingsList = response.data
        ratingsList.forEach(function(obj) {
            deleteExpRatings(obj._id);
          }); 
    }

    const deleteExpRatings = async(_id) => {
        const token = await getAccessTokenSilently();
        const config = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        }
        let route = `ratings/${_id}`
        const response = await callProtectedAPI(config, route);
        if (response.status === 204) {
            console.log(`Deleted rating ${_id}`)
        } else {
            alert(`Failed to delete rating ${_id}, status code ${response.status}`);
        }

    }

    useEffect(() => {
        loadExperiences();
    }, [experienceLength, loadExperiences, query]);

    const handleMileRadius = async (e) => {
        if (e.target.value) {
            setMileRadius(e.target.value);
        }
        else {
            setMileRadius(15);
        }
    }

    
    return (
        <div className="homepage-container">

            <article>
                <h2 className="home-title">Recently Added Experiences</h2>

                <div className="home-search">
                    <div className="home-search-row">
                        <input
                            className="search-city"
                            placeholder="Location search (e.g. England or Corvallis, OR)"
                            onChange={e => { setQuery(e.target.value) }}
                        ></input>
                        <input
                            className="search-city"
                            placeholder="Search radius (default 15 mi)"
                            onChange={e => { handleMileRadius(e) }}
                        >
                        </input>
                        
                    </div>
                    <div className="home-search-row">
                        <input
                            className="search-keyword"
                            placeholder="Search by keyword..."
                            onChange={e => { setKeyword(e.target.value) }}
                        ></input>
                        <button className="home-create-link"><a href="/experiences/create">Create Experience</a></button>
                    </div>
                    

                </div>
                
                <div className="home-little-border">
                <div className="home-table-holder">
                <ExperienceList
                    // Filter experiences in-line, no need to make backend call
                    experiences={keyword ? experiences.filter(val => val.keywords.some(word => word.includes(keyword))) : experiences}
                    onDelete={onDeleteExperience}
                />
                </div>
                </div>
            </article>
        </div>
    )
}

export default Home;
