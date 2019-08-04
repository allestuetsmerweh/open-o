import React from 'react';
import PropTypes from 'prop-types';
import {RestApi, WebStorageTokenStorage} from '../api';

const OpenORestApiContext = React.createContext(null);

const openOTokenKey = 'openOToken';
const openORestApi = new RestApi('/api');

export const OpenORestApiProvider = (props) => {
    const [token, setToken] = React.useState(undefined);

    React.useEffect(() => {
        openORestApi.tokenStorage = new WebStorageTokenStorage(
            window.localStorage,
            openOTokenKey,
        );
    }, []);

    React.useEffect(() => {
        if (!openORestApi.tokenStorage) {
            return () => undefined;
        }
        const handleTokenChange = (e) => {
            const newToken = e.token;
            setToken(newToken);
            if (newToken) {
                openORestApi.get('me', {})
                    .catch((err) => {
                        console.warn(err);
                        openORestApi.tokenStorage.setToken(undefined);
                    });
            }
        };
        openORestApi.tokenStorage.addEventListener('tokenChange', handleTokenChange);
        return () => {
            openORestApi.tokenStorage.removeEventListener('tokenChange', handleTokenChange);
        };
    }, [openORestApi]);

    return (
        <OpenORestApiContext.Provider value={openORestApi} key={token}>
            {props.children}
        </OpenORestApiContext.Provider>
    );
};
OpenORestApiProvider.propTypes = {
    children: PropTypes.node,
};

export const useOpenORestApi = () => (
    React.useContext(OpenORestApiContext)
);
