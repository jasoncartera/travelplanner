import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import { useNavigate } from "react-router-dom";


/*
https://developer.auth0.com/resources/guides/spa/react/basic-authentication
*/
export const Auth0ProviderWithNavigate = ({ children }) => {
    const navigate = useNavigate();

    const domain = 'dev-mdv72n76e8xfie3g.us.auth0.com';
    const clientId = 'bAueubbgIx7q5qD61Og0ZAlky107l9nr'
    const redirectUri = process.env.REACT_APP_AUTH0_CALLBACK_URL ||'https://travel-planner-375018.web.app/';
    const audience = 'https://cs467-travelplanner-server-axlzyx77rq-uw.a.run.app';

    const onRedirectCallback = (appState) => {
        navigate(appState?.returnTo || window.location.pathname);
    };

    if (!(domain && clientId && redirectUri)) {
        return null;
    }

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                audience: audience,
                redirect_uri: redirectUri,
            }}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    );
};
