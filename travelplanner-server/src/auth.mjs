import { auth } from 'express-oauth2-jwt-bearer';

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
/*
Source: Authenticating an API
https://auth0.com/docs/quickstart/spa/react/02-calling-an-api
*/
const jwtCheck = auth({
  audience: 'https://cs467-travelplanner-server-axlzyx77rq-uw.a.run.app',
  issuerBaseURL: `https://dev-mdv72n76e8xfie3g.us.auth0.com/`,
});

export {jwtCheck};