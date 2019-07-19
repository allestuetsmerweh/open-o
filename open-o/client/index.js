import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter, Route} from 'react-router-dom';
import indexHtml from './index.html';
import stylesCss from './styles.css';
import {MyEventListView} from './views/MyEventListView';
import {EventDetailView} from './views/EventDetailView';
import {CompetitorRegistrationView} from './views/CompetitorRegistrationView';
import {IofXmlImportView} from './views/IofXmlImportView';

export default () => indexHtml.replace(
    '<!--INSERT_CSS_HERE-->',
    `<style>${stylesCss.toString()}</style>`,
);

if (window.addEventListener) {
    window.addEventListener('load', () => {
        ReactDOM.render(
            (
                <HashRouter>
                    <Route exact path="/" component={MyEventListView} />
                    <Route exact path="/events/:eventId" component={EventDetailView} />
                    <Route exact path="/events/:eventId/registration" component={CompetitorRegistrationView} />
                    <Route exact path="/events/:eventId/import" component={IofXmlImportView} />
                </HashRouter>
            ),
            window.document.getElementById('root'),
        );
    });
}
