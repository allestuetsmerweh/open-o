import React from 'react';
import PropTypes from 'prop-types';
import {RestApi} from '../api';

const OpenORestApiContext = React.createContext(null);

const openORestApi = new RestApi('/api');

export const OpenORestApiProvider = (props) => (
    <OpenORestApiContext.Provider value={openORestApi}>
        {props.children}
    </OpenORestApiContext.Provider>
);
OpenORestApiProvider.propTypes = {
    children: PropTypes.node,
};

export const useOpenORestApi = () => (
    React.useContext(OpenORestApiContext)
);
