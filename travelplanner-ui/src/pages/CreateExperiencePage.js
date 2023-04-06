import React, { useState } from 'react';
import { callProtectedAPI } from '../utils/message.util';
import { useAuth0 } from "@auth0/auth0-react";

var imageUrls;

export const CreateExperiencePage = () => {
    const [experienceTitle, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [keywords, setKeywords] = useState('');
    const { getAccessTokenSilently } = useAuth0();

    const uploadImage = async() => {
        console.log("Uploading image(s)")
        const uploadedImages = document.getElementById('file').files

        if (Object.keys(uploadedImages).length > 3) {
            alert(`You have selected more than 3 files. Please remove some.`)
            return false;
        }

        const formData = new FormData();

        Object.keys(uploadedImages).forEach(key => {
            formData.append('file', uploadedImages.item(key))
        })

        const token = await getAccessTokenSilently();
        let config = {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        }
        let route = 'images';
        const response = await callProtectedAPI(config, route);
        if (response.status === 200) {
            //alert("Successfully uploaded");
            imageUrls = response.data.URLs;
            return true;
        } else if (response.status === 400) {
            alert('One of more of your files is > 5MB. Please remove.')
            return false;
        } else {
            alert(`Failed to upload, status code ${response.status}`);
            return false;
        }
    }

    const addExperience = async() => {
        const uploadSuccessful = await uploadImage();
        if (!uploadSuccessful) return;

        console.log("Adding experience")
        let location = {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };

        //Default avgRating score when new experience is created
        const avgRating = 0;

        const newExperience = {experienceTitle, description, location, imageUrls, avgRating, keywords};
        console.log(JSON.stringify(newExperience));
        const token = await getAccessTokenSilently();
        console.log("Console output: ",JSON.stringify(newExperience));
        const config = {
            method: 'POST',
            body: JSON.stringify(newExperience),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        }
        let route = 'experiences/create';
        const response = await callProtectedAPI(config, route)
        if (response.status === 200) {
            alert("Successfully added the experience");
        } else {
            alert(`Failed to add experience, status code ${response.status}`);
        }
    }

    return (
        // TODO: disable overall form submit until uploadImage is successful
        <div>
            <div className='page-header'>
            <h3>Create Experience</h3>
            </div>
            <div className='profileForm'>
            <form>
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
                <button className='button'
                    type="button"
                    onClick={addExperience}
                >Add</button>
            </form>
            </div>
        </div>
    );
}

export default CreateExperiencePage;