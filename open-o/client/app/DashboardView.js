import React from 'react';
import {Link} from 'react-router-dom';
import {useIsOnline} from './hooks';

export const DashboardView = () => {
    const isOnline = useIsOnline();

    const registerLink = (
        <div key='register'>
            <Link to={'register'}>Register in Competitor Database</Link>
        </div>
    );
    const loginLink = (
        <div key='login'>
            <Link to={'login'}>Log in</Link>
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
            {isOnline && registerLink}
            {loginLink}
            {myEventsLink}
            {isOnline && resultsLink}
        </div>
    );
};
