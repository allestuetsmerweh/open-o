import React from 'react';
import ReactDOM from 'react-dom';
import indexHtml from './index.html';
import stylesCss from './styles.css';
import {OpenORestApiProvider} from './app/OpenORestApi';
import {OpenORouter} from './app/OpenORouter';

export default () => indexHtml.replace(
    '<!--INSERT_CSS_HERE-->',
    `<style>${stylesCss.toString()}</style>`,
);

if (window.addEventListener) {
    window.addEventListener('load', () => {
        ReactDOM.render(
            (
                <OpenORestApiProvider>
                    <OpenORouter/>
                </OpenORestApiProvider>
            ),
            window.document.getElementById('root'),
        );
    });
}
