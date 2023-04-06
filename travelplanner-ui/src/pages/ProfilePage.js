import React, { useState } from 'react';
import { callProtectedAPI } from '../utils/message.util';
import { useAuth0 } from "@auth0/auth0-react";
import axios from 'axios';

export const ProfilePage = () => {
    const [nickname, setNickname] = useState('');
    const [userName, setUserName] = useState('');
    const { user, getAccessTokenSilently } = useAuth0();

    const updateProfile = async () => {
        const token = await getAccessTokenSilently();
        let updatedUser = { userName: userName, nickname: nickname };

        let config = {
            method: 'PATCH',
            body: JSON.stringify(updatedUser),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        }
        let route = 'users';
        const response = await callProtectedAPI(config, route);
        if (response.status === 200) {
            alert("Successfully updated user with status 200");
        } else if (response.status === 400) {
            alert("Didn't udpate status 400")
        } else {
            alert(`Failed to upload, status code ${response.status}`)
        }
    }

    const updatePassword = async () => {
        var options = {
            method: 'POST',
            url: 'https://dev-mdv72n76e8xfie3g.us.auth0.com/dbconnections/change_password',
            headers: {'content-type': 'application/json'},
            data: {
              client_id: 'bAueubbgIx7q5qD61Og0ZAlky107l9nr',
              email: user.email,
              connection: 'Username-Password-Authentication'
            }
          };
        
          axios.request(options).then(function (response) {
            console.log(response.data);
            alert("Email sent to change password");
          }).catch(function (error) {
            console.error(error);
          });
    }

    return (
        <div>
            <div className='profileHeaderPosition'>
            <h2 className='profileHeader'>User Profile</h2>
            </div>
            <div className='profileForm'>
            <p className='profileIntro'>Welcome, {user.name}</p>
            <p className='profileIntro'>Nickname: {user.nickname}</p>
            
            <form className='form'>
                <input className='input'
                    type="text"
                    placeholder="Enter Name (First Last)"
                    value={userName}
                    onChange={e => setUserName(e.target.value)} />
                <input className='input'
                    type="text"
                    placeholder="Enter nickname"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)} />
                <button className='button'
                    type="button"
                    onClick={updateProfile}>
                    Update</button>
            </form>

            <button className='button'
                    type="button"
                    onClick={updatePassword}>
                    Change Password</button>
            </div>
        </div>
    );
}


export default ProfilePage;
