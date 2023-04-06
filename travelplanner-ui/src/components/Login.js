import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

// https://auth0.com/docs/quickstart/spa/react?framed=1&sq=1#configure-auth0
const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button onClick={() => loginWithRedirect()}>Log In</button>;
};

export default LoginButton;