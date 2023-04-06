import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

// https://auth0.com/docs/quickstart/spa/react?framed=1&sq=1#configure-auth0
const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
      Log Out
    </button>
  );
};

export default LogoutButton;