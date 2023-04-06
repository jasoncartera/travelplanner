import React from 'react';
import { MdDelete } from 'react-icons/md';
import { FaRegEdit } from 'react-icons/fa';
import '../App.css';
import { useAuth0 } from "@auth0/auth0-react";
import Stars from '../utils/starOnly';
import { useNavigate } from 'react-router-dom';


function Experience({ experience, onDelete }) {
    const navigate = useNavigate();
    const { user } = useAuth0();
    const avgRating = Math.round(experience.avgRating["$numberDecimal"]);

    const onEdit = (experience) => {
        navigate(`/experiences/edit`, {state: experience});

    }

    const routeExperience = () => {
        var path = `/experiences/${experience._id}`
        navigate(path);
    }

    return (
        <tr>
            <td><img className='list-img' src={experience.imageUrls[0]} alt={experience.experienceTitle}/></td>
            <td> <span onClick={routeExperience} style={{cursor: 'pointer'}}><h3 className='experience-title'>{experience.experienceTitle}</h3> </span>
            <br></br>
            <h5 className='experience-location'>Location:</h5> {experience.latitude} {experience.longitude}
            <br></br>
            <h5 className='experience-rating'>Avg Rating:</h5> <Stars highlight={avgRating} /> 
            <br></br>
            <h5 className='experience-description'>Description Preview:</h5> {experience.description}</td>
            {RenderEditDelete(experience, onEdit, onDelete, user)}
           
        </tr>
    );
}



function RenderEditDelete(experience, onEdit, onDelete, user) {
    if (user && experience.user === user.sub) {
        return (
            <>
                <td><FaRegEdit style={{cursor: 'pointer'}} onClick={() => onEdit(experience)} /></td>
                <td><MdDelete style={{cursor: 'pointer'}} onClick={() => onDelete(experience._id)} /></td>
            </>
        );
    } else {
        return (
            <>
                <td></td>
                <td></td>
            </>
        )
    }
}

export default Experience;
