import React from 'react';
import {HashRouter, Route} from 'react-router-dom';
import {DashboardView} from './DashboardView';
import {UserLoginView} from './UserLoginView';
import {UserRegistrationView} from './UserRegistrationView';
import {MyEventListView} from './MyEventListView';
import {EventDetailView} from './EventDetailView';
import {EventCompetitorRegistrationView} from './EventCompetitorRegistrationView';
import {IofXmlImportView} from './IofXmlImportView';

export const OpenORouter = () => (
    <HashRouter>
        <Route exact path="/" component={DashboardView} />
        <Route exact path="/login" component={UserLoginView} />
        <Route exact path="/register" component={UserRegistrationView} />
        <Route exact path="/my_events" component={MyEventListView} />
        <Route exact path="/my_events/:eventId" component={EventDetailView} />
        <Route exact path="/my_events/:eventId/registration" component={EventCompetitorRegistrationView} />
        <Route exact path="/my_events/:eventId/import" component={IofXmlImportView} />
    </HashRouter>
);
