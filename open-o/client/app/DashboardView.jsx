import React from 'react';
import {Link} from 'react-router-dom';
import {useIsOnline} from './hooks';
import {useOpenORestApi} from './OpenORestApi';

export const DashboardView = () => {
    const isOnline = useIsOnline();
    const api = useOpenORestApi();
    const isLoggedIn = api.tokenStorage && api.tokenStorage.token !== undefined;

    const registerLink = (
        <div key='register'>
            <Link to={'register'}>Register</Link>
        </div>
    );
    const loginLink = (
        <div key='login'>
            <Link to={'login'}>Log in</Link>
        </div>
    );
    const competitorsLink = (
        <div key='competitors'>
            <Link to={'competitors'}>Competitors</Link>
        </div>
    );
    const myEventsLink = (
        <div key='my_events'>
            <Link to={'my_events'}>My Events</Link>
        </div>
    );
    const resultsLink = (
        <div key='results'>
            <Link to={'results'}>View Event Results</Link>
        </div>
    );

    return (
        <div>
            {isOnline && !isLoggedIn && registerLink}
            {isOnline && !isLoggedIn && loginLink}
            {isOnline && competitorsLink}
            {myEventsLink}
            {isOnline && resultsLink}
        </div>
    );
};
