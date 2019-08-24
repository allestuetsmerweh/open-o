import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {useOpenORestApi} from './OpenORestApi';

export const UserRegistrationView = (props) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const api = useOpenORestApi();

    const handleSubmit = () => {
        api.post('signup', {email: email, password: password})
            .then((response) => {
                console.warn(response.data);
                if (response.data && response.data.type === 'Token' && response.data.id) {
                    api.tokenStorage.setToken(response.data.id);
                    props.onSuccess(response);
                }
            });
    };

    // TODO: Retype password
    return (
        <div>
            <div><Link to={'/'}>Back to Home</Link></div>
            <form onSubmit={handleSubmit}>
                <div>
                    E-Mail:  <input
                        value={email}
                        onChange={(changeEvent) => {
                            const newEmail = changeEvent.target.value;
                            setEmail(newEmail);
                        }}
                    />
                </div>
                <div>
                    Password:  <input
                        type='password'
                        value={password}
                        onChange={(changeEvent) => {
                            const newPassword = changeEvent.target.value;
                            setPassword(newPassword);
                        }}
                    />
                </div>
                <div>
                    <input
                        type='submit'
                        value='Sign up'
                    />
                </div>
            </form>
        </div>
    );
};
UserRegistrationView.propTypes = {
    onSuccess: PropTypes.func,
};
UserRegistrationView.defaultProps = {
    onSuccess: () => {
        window.location.href = '#/';
    },
};
