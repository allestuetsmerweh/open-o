import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {useOpenORestApi} from './OpenORestApi';

export const CompetitorsView = () => {
    const api = useOpenORestApi();

    return (
        <div>
            <div><Link to={'/'}>Back to Home</Link></div>
        </div>
    );
};
CompetitorsView.propTypes = {
    onSuccess: PropTypes.func,
};
CompetitorsView.defaultProps = {
    onSuccess: () => {
        window.location.href = '#/';
    },
};
