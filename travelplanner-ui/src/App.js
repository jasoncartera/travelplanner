import './App.css';
import { Routes, Route } from "react-router-dom";
import { useAuth0 } from '@auth0/auth0-react';
import { PageLoader } from "./components/PageLoader";
import { AuthenticationGuard } from './components/authentication-guard';
import CreateExperiencePage from './pages/CreateExperiencePage';
import EditExperiencePage from './pages/EditExperiencePage';
import CreateTripPage from './pages/CreateTripPage';
import ViewExperiencePage from './pages/ViewExperiencePage';
import EditTripPage from './pages/EditTripPage';
import Navigation from './components/Navigation';
import Home from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import ProfilePage from './pages/ProfilePage';
import TripsPage from './pages/TripsPage';
import ViewTripPage from './pages/ViewTripPage';


function App() {
    const {isLoading } = useAuth0();
    if (isLoading) {
        return (
            <div>
                <PageLoader />
            </div>
        );
    }

  return (
    <div className="App">
        <div className="App-header">
            <Navigation />
            <Routes>
            <Route exact path="/*" element={<Home />}></Route>
            <Route path="/experiences/create" element={<AuthenticationGuard component={CreateExperiencePage} />}></Route>
            <Route path="/experiences/:experienceId" element={<ViewExperiencePage />}></Route>
            <Route path="/experiences/edit" element={<AuthenticationGuard component = {EditExperiencePage} />}></Route>
            <Route path="/trips" element={<AuthenticationGuard component = {TripsPage} />}></Route>
            <Route path="/trips/:tripId" element={<AuthenticationGuard component = {ViewTripPage} />}></Route>
            <Route path="/trips/create" element={<AuthenticationGuard component={CreateTripPage} />}></Route>
            <Route path="/trips/edit" element={<AuthenticationGuard component = {EditTripPage} />}></Route>
            <Route path="/profile" element={<AuthenticationGuard component = {ProfilePage} />}></Route>
            <Route path="/login" element={<LoginPage />}></Route>
            <Route path="/logout" element={<AuthenticationGuard component= {LogoutPage} />}></Route>
            </Routes>
        </div>
    </div>
    );
}

export default App;
