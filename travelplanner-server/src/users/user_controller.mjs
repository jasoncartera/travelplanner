import express from 'express';
import { jwtCheck } from '../auth.mjs';
import axios from 'axios';
import dotenv from 'dotenv';

const userRouter = express.Router();
dotenv.config()

userRouter.patch('/', jwtCheck, async (req, res) => {
    console.log("Received PATCH request to update user");
    const data = {};
    if (req.body.userName !== '') {
        data["name"] = req.body.userName;
    }
    if (req.body.nickname !== '') {
        data["nickname"] = req.body.nickname;
    }
    const token = await getManagmentToken();
    const config = {
        method: 'PATCH',
        url: `https://dev-mdv72n76e8xfie3g.us.auth0.com/api/v2/users/${req.auth.payload.sub}`,
        data: data,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    // Returns No content on successful update
    try {
        const user = await axios.request(config);
        res.status(200).json({ data: 'Updated' });
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }

});

const getManagmentToken = async () => {

    var options = {
        method: 'POST',
        url: 'https://dev-mdv72n76e8xfie3g.us.auth0.com/oauth/token',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: 'KcpU2UiINtrrL3FkphJxtbuWGtLjT7ox',
            client_secret: process.env.OAUTH_SECRET,
            audience: 'https://dev-mdv72n76e8xfie3g.us.auth0.com/api/v2/'
        })
    };

    try {
        const response = await axios.request(options);
        return response.data['access_token']
    } catch (error) {
        console.log(error);
        return null;
    }
}

export { userRouter };