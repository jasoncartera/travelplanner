import React, { useState, useEffect, useCallback } from 'react';
import { callProtectedAPI } from '../utils/message.util';
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from 'react-router-dom';

export const EditExperiencePage = () => {
    const { state } = useLocation();
    const [experienceTitle, setTitle] = useState(state ? state.experienceTitle : '');
    const [description, setDescription] = useState(state ? state.description : '');
    const [latitude, setLatitude] = useState(state ? state.location.coordinates[1] : '');
    const [longitude, setLongitude] = useState(state ? state.location.coordinates[0] : '');
    const [images, setImages] = useState(state ? state.imageUrls: []);
    const [keywords, setKeywords] = useState(state ? state.keywords : '');
    const [experienceId, setExperienceId] = useState(state ? state._id : '');
    const [userExperiences, setUserExperiences] = useState([]);
    const [userExperiencesLength, setUserExperiencesLength] = useState('');
    const { getAccessTokenSilently } = useAuth0();

    const editExperience = async () => {
        let location = {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };
        const editExperience = { experienceTitle, description, location, keywords };
        console.log(JSON.stringify(editExperience));
        const token = await getAccessTokenSilently();
        const config = {
            method: 'PUT',
            body: JSON.stringify(editExperience),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        }
        let route = `experiences/${experienceId}/edit`;
        const response = await callProtectedAPI(config, route)
        if (response.status === 200) {
            alert("Successfully edited the experience.");
        } else {
            alert(`Failed to edit the experience, status code ${response.status}`);
        }
        getUserExperiences();
    }

    const getUserExperiences = useCallback(async () => {
        const token = await getAccessTokenSilently();
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        }
        let route = 'experiences/user';
        const response = await callProtectedAPI(config, route)
        setUserExperiences(response.data);
        setUserExperiencesLength(Object.keys(response.data).size);
    }, [getAccessTokenSilently]);

    useEffect(() => {
        getUserExperiences();
    }, [getUserExperiences, userExperiencesLength]);

    const handleSelectChange = async (id) => {
        const userExperience = userExperiences.find(({_id}) => _id === id);
        console.log(userExperience);
        setExperienceId(userExperience._id);
        setTitle(userExperience.experienceTitle);
        setDescription(userExperience.description);
        setLatitude(userExperience.location.coordinates[1]);
        setLongitude(userExperience.location.coordinates[0]);
        setImages(await userExperience.imageUrls);
        setKeywords(userExperience.keywords);
    }

    const deleteImage = async (imageUrl) => {
        const token = await getAccessTokenSilently();
        let config = {
            method: 'DELETE',
            body: JSON.stringify({imageUrl: imageUrl, experienceId: experienceId}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        }
        let route = 'images';
        const response = await callProtectedAPI(config, route);
        if (response.status === 200) {
            setImages(response.data.imageUrls);
        } else {
            alert(`Failed to delete the, status code ${response.status}`);
        }
    }

    const addImages = async() => {
        console.log("Uploading image(s)")
        const uploadedImages = document.getElementById('file').files

        if (Object.keys(uploadedImages).length + images.length > 3) {
            alert(`An experience can only have 3 images in total. Please delete some images or remove some of your new uploads.`)
            return false;
        }

        const formData = new FormData();

        Object.keys(uploadedImages).forEach(key => {
            formData.append('file', uploadedImages.item(key))
        });
        formData.append('_id', experienceId);

        const token = await getAccessTokenSilently();
        let config = {
            method: 'PUT',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        }
        let route = 'images';
        const response = await callProtectedAPI(config, route);
        if (response.status === 200) {
            alert('Uploaded your image(s).')
            setImages(response.data.imageUrls);
        } else if (response.status === 400) {
            alert('One of more of your files is > 5MB. Please remove.')
        } else {
            alert(`Failed to upload, status code ${response.status}.`);
        }
    }

    return (
        <div>
            <div className='page-header'>
                <h3>Edit Experience</h3>
            </div>
            <div className='profileForm'>
                <form>
                    <select
                        name="experience-dropdown"
                        onChange={e => handleSelectChange(e.target.value)}>
                        {userExperiences && userExperiences.map((item, index) => {
                            return <option selected={experienceId===item._id} key={index} value={item._id}>{item.experienceTitle}</option>
                        })}
                    </select>
                    <input className='input'
                        type="text"
                        placeholder="Enter experience name"
                        value={experienceTitle}
                        onChange={e => setTitle(e.target.value)} />
                    <input className='input'
                        type="description"
                        placeholder="Enter experience description"
                        value={description}
                        onChange={e => setDescription(e.target.value)} />
                    <input className='input'
                        type="number"
                        placeholder="Enter latitude"
                        value={latitude}
                        onChange={e => setLatitude(e.target.value)} />
                    <input className='input'
                        type="number"
                        placeholder="Enter longitude"
                        value={longitude}
                        onChange={e => setLongitude(e.target.value)} />
                    <input className='input'
                        type="text"
                        placeholder="Enter keywords"
                        value={keywords}
                        onChange={e => setKeywords(e.target.value)} />
                    <input className='image'
                        type="file"
                        id="file"
                        accept="image/*"
                        multiple
                    />
                    <div>
                        <button
                            className='button'
                            id='upload'
                            type='button'
                            onClick={addImages}
                        >Upload</button>
                    </div>
                    <div className='image-gallery' id='image'>
                        {images.map((image, i) => {
                            return (
                            <div key={i}>
                                <img className='img' src={image} alt={image}/>
                                <button className='button'
                                    type="button"
                                    id={image}
                                    onClick={e => deleteImage(e.target.id)}
                                >Delete</button>
                            </div>
                            );
                        })}
                    </div>
                    <button className='button'
                        type="button"
                        onClick={editExperience}
                    >Edit</button>
                </form>
            </div>
        </div>
    );
}

export default EditExperiencePage;