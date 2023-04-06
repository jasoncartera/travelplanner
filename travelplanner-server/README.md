# Developer Setup
Create a `.env` file in the root directory following the template in `.env.template`. Replace `<user>` and `<password>` in the URI with your username and password which you should have if you are authorized to contribute to this project.

To run the server with `nodemon` so that the server instance automatically restarts upon source code saving, run with `npm run dev` instead of `npm start`.

# Testing
## Manual API HTTP Requests
Either test on a personal MongoDB database and update your `.env` with the URI or clean up any testing artifacts from the production database after testing.

1. Install the [`REST Client` extension for VS Code](https://marketplace.visualstudio.com/items?itemName=humao.rest-client). This allows you to test HTTP requests and responses within VS Code and is required for testing until UI CRUD functionality is impelemented.
2. Duplicate the test template(s) in `tests/` and remove the `.template` file extension. Note: If testing GET/POST/DELETE, you will need to update the URL parameter with the appropriate `_id` which you can retrieve from viewing the PUTed document in the MongoDB database web interface
3. In the request headers, replace `<access token without quotes>` with the JWT access token for a user without quotation marks. Keep `Bearer`.

Ex:
```
POST http://localhost:8080/experiences/create HTTP/1.1
Content-Type: application/json
Authorization: Bearer eyJh...
```
4. Run `npm start`
5. After installing `REST Client`, you should see a small "Send Request" button above and to the left of each HTTP request. Click the button to make the request.


## Requesting a JWT token from a user
OAuth handles authentication in the front-end. A JWT token must be passed to protected routes in the Authorization header:
    GET http://localhost:8080/
    Authorization: Bearer token

### Obtaining Access Tokens
#### For admin
1. Login to the OAuth account (https://auth0.auth0.com/), go to Applications -> APIs -> TravelPlanner -> Test.
2. Copy the access token

#### For a specific user

Using this guide: https://auth0.com/docs/api/authentication?shell#get-code-or-link

Run the following command:

`curl --request POST \
  --url 'https://dev-mdv72n76e8xfie3g.us.auth0.com/oauth/token' \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data 'grant_type=password&username=EMAIL&password=PASSWORD!&audience=https://cs467-travelplanner-server-axlzyx77rq-uw.a.run.app&client_id=bAueubbgIx7q5qD61Og0ZAlky107l9nr&client_secret=CLIENT_SECRET'`

1. The domain can be found in the OAuth console from Applications -> Applications -> TravelPlanner -> Settings
2. Username is email used to sign up, password is password
3. Audience is in request above
4. Client secret can be found in Applications -> Applications -> TravelPlanner -> Settings

# Resources
## APIs
[Bing Maps Locations API](https://learn.microsoft.com/en-us/bingmaps/rest-services/locations/) for location search

[MongoDB Atlas Search](https://www.mongodb.com/docs/manual/text-search/) for relevance-based keyword search

