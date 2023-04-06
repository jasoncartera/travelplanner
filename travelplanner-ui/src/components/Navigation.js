import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";

function Navigation() {
    const {isAuthenticated } = useAuth0();

    return (
        <div className='nav-padding'>
            <nav className='App-navigation'>
                <div className='nav-link'>
                    <h2>Travel Planner</h2>
                </div>
                <div className='nav-link'>
                    <h2><Link to='/'>Home</Link></h2>
                </div>
                {!isAuthenticated && (
                    <>
                        <div className='nav-link'>
                            <h2><Link to='/login'>Login</Link></h2>
                        </div>
                    </>
                )}
                {isAuthenticated && (
                    <>
                        <div className='nav-link'>
                            <h2><Link to='/experiences/create'>Create Experience</Link></h2>
                        </div>
                        <div className='nav-link'>
                            <h2><Link to='/experiences/edit'>Edit Experience</Link></h2>
                        </div>
                        <div className='nav-link'>
                            <h2><Link to='/trips'>My Trips</Link></h2>
                        </div>
                        <div className='nav-link'>
                            <h2><Link to='/trips/create'>Create Trip</Link></h2>
                        </div>
                        <div className='nav-link'>
                            <h2><Link to='/trips/edit'>Edit Trip</Link></h2>
                        </div>
                        <div className='nav-link'>
                            <h2><Link to='/profile'>Profile</Link></h2>
                        </div>
                        <div className='nav-link'>
                            <h2><Link to='/logout'>Logout</Link></h2>
                        </div>
                    </>
                )}
            </nav>
        </div>
    );
}

export default Navigation;