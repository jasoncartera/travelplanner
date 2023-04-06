import React, { useState, useEffect  } from "react";
import { callProtectedAPI } from '../utils/message.util';
import { useAuth0 } from "@auth0/auth0-react";

//https://dev.to/michaelburrows/create-a-custom-react-star-rating-component-5o6


const StarRating = ({initialRating, experienceId, initialId}) => {
    const [rating, setRating] = useState(initialRating);
    const [hover, setHover] = useState(0);
    const [userId, setUserId] = useState('');
    const [ratingId, setRatingId] = useState(initialId);
    const [ratingRes, setRatingRes] = useState();
    const { getAccessTokenSilently, user } = useAuth0(); 
     
    useEffect(() => {
        async function fetchData() {
          if (initialRating !== null) {       
            setRating(initialRating);
          }
          setRatingId(initialId)
        }
        fetchData();
      }, [initialRating, initialId]);

    useEffect(() => {
        if (ratingRes) {
          setRatingId(ratingRes._id)
          //console.log(`Got new rating id ${ratingRes._id}`)
        }
      }, [ratingRes])

    const addRating = async(index) => {
      setUserId(user.sub)
      const rating = index
      const experienceID = experienceId
      //console.log(`Creating rating with User ID ${userId}, Experience ID ${experienceID}, Initial Rating ${rating}`)
      const newRating = {userId, experienceID, rating}
      //console.log(JSON.stringify(newRating))
      const token = await getAccessTokenSilently();
      const config = {
        method: 'POST',
        body: JSON.stringify(newRating),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
        let route = 'ratings/create';
        const response = await callProtectedAPI(config, route)
        if (response.status === 200) {
          alert(`You gave this experience a ${rating}!`);
            
        } else {
            alert(`Failed to add the rating, status code ${response.status}`);
            return false
        }
        return true
    }
    
    const deleteRating = async() => {
      setUserId(user.sub)
      console.log(`Deleting rating ${ratingId}`)
      const token = await getAccessTokenSilently();
      const config = {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          }
      }
      let route = `ratings/${ratingId}`;
      const response = await callProtectedAPI(config, route);
      if (response.status === 204) {
          //console.log(`Deleted rating id: ${ratingId}`)
          alert("Deleted your rating!")
      } else {
          alert(`Failed to delete the rating, status code ${response.status}`);
          return false
      }
      return true
  }


  const updateRating = async(index) => {
    setUserId(user.sub)
    const rating = index
    //console.log(`Updating rating id ${ratingId},new rating ${rating}`)
    const newRating = {rating}
    //console.log(JSON.stringify(newRating))
    const token = await getAccessTokenSilently();
    const config = {
      method: 'PUT',
      body: JSON.stringify(newRating),
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      }
      let route = `ratings/${ratingId}/edit`;
      const response = await callProtectedAPI(config, route)
      if (response.status === 200) {
          alert(`You updated your rating to ${rating}!`);
      } else {
          alert(`Failed to update the rating, status code ${response.status}`);
          return false
      }

      return true
  }

  const loadUserRating = async() => {
      if (user == null) {
          console.log("No user ID returned")
          setRating(0) 
          return
      }
      
      const userId = user.sub

      const token = await getAccessTokenSilently();
      
      let config = {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
          }
      }

      let route = `ratings/experience/${experienceId}/${userId}`
      const response = await callProtectedAPI(config, route)
      if (response.status === 200) {
          console.log("Successfully retrieved new user rating id");
      } else {
          alert(`Failed to retrieve user rating id, status code ${response.status}`);
          return false
      }

      setRatingRes(await response.data);
      return true

  }


  const getAvgRating = async() => {

    // GET NEW AVERAGE RATING
    const token = await getAccessTokenSilently();

    let getConfig = {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
      }
    }

    let getAvgRoute = `ratings/experience/${experienceId}`

    const getResponse = await callProtectedAPI(getConfig, getAvgRoute)
    if (getResponse.status === 200) {
        console.log("Successfully retrieved new average rating");
    } else {
        alert(`Failed to retrieve new average rating, status code ${getResponse.status}`);
    }

    return getResponse.data
  }

  const updateAvgRating = async(avgRating) => {
    // UPDATE AVG RATING FOR EXPERIENCE
    const token = await getAccessTokenSilently();
    let averageRating = {avgRating}
    //console.log('Attempting to update average rating', JSON.stringify(averageRating))

    let putConfig = {
      method: 'PUT',
      body: JSON.stringify(averageRating),
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
      }

    }

    let putAvgRoute = `experiences/${experienceId}/avgRating`

    const putResponse = await callProtectedAPI(putConfig, putAvgRoute)
    if (putResponse.status === 200) {
        console.log("Successfully updated average rating to", avgRating);
    } else {
        alert(`Failed to update the new average rating, status code ${putResponse.status}`);
    }
  }

  const handleClick = async (index) => {
    if (rating === 0) { //Create rating if rating is 0
      if (addRating(index)) {
        if (loadUserRating()) {
          setRating(index)
        }
      }

    } else if (index === rating) { // Delete rating and reset starts if click on current rating
      if (deleteRating()) {
        setRating(0);
      }

    } else {  //Update rating to new rating 
      if (updateRating(index)) {
        setRating(index);
      }
    }

    setTimeout(async function() { // retreiving new average on one second delay to give database a chance to update
      let res = await getAvgRating() // update average rating after any click
      let ratingAvg = 0 
      if (res[0] ) { // check if there are any ratings for this experience
        ratingAvg = res[0]['avgQuantity']
      }
      updateAvgRating(ratingAvg)
    }, 1000);
  };
  

    return (
      <div className="star-rating">
        {[...Array(5)].map((star, index) => {
          index += 1;
          return (
            <button
              type="stars"
              key={index}
              className={index <= (hover || rating) ? "on" : "off"}
              onClick={() => handleClick(index)}
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(rating)}
            >
              <span className="star" style={{ fontSize: "2rem" }}>&#9733;</span>
            </button>
          );
        })}
      </div>
    );
  };


export default StarRating;
