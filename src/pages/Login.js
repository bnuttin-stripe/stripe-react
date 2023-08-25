import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { customerAtom } from '../data/atoms';
import { Link } from 'react-router-dom';

export default function Login(props) {
    const [email, setEmail] = useState('');
    const [formValid, setFormValid] = useState(false);
    const [loginValid, setLoginValid] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [customer, setCustomer] = useRecoilState(customerAtom);

    const login = async e => {
        setProcessing(true);
        e.preventDefault();
        fetch('/customers/' + email)
            .then(res => res.json())
            .then(data => {
                if (data.id !== "") {
                    setCustomer(data);
                }
                setLoginValid(data.id !== "");
                setProcessing(false);
            })
    }

    useEffect(() => {
        setFormValid(email !== '')
    }, [email]);

    return (
        <div className="row justify-content-center align-items-center">
            <form className="col-6 mt-5" onSubmit={login}>
                <div className="mb-3">
                    <label>Email</label>
                    <input required className="form-control" onChange={e => setEmail(e.target.value)} />
                    {!loginValid && <small className="form-text error">Email not found; please click the Register button to register a new account.</small>}
                </div>
                <div className="mb-3">
                    <label>Password</label>
                    <input type="password" disabled className="form-control" placeholder="Not functional in demo app" />
                </div>
                <div className="mt-5 mb-3">
                    <button disabled={!formValid || processing} className="form-control btn btn-primary" type="submit">Login</button>
                </div>
                <div className="mb-3">
                    <Link to={'/register/' + email}><button className="form-control btn btn-secondary" >Register</button></Link>
                </div>
            </form>
        </div>
    )
}
