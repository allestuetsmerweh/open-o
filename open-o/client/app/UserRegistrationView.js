import React from 'react';
import {Link} from 'react-router-dom';
import {useOpenORestApi} from './OpenORestApi';

export const UserRegistrationView = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const api = useOpenORestApi();

    const handleSubmit = () => {
        console.warn(email, password);
        api.post('signup', {username: email, password: password})
            .then((wtf) => {
                console.warn(wtf);
            });
    };

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
