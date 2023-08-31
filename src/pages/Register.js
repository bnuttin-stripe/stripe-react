import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { customerAtom } from '../data/atoms';
import { useParams } from 'react-router-dom';
import * as Utils from '../utilities';

export default function Register(props) {
    const { attemptedEmail } = useParams();

    const [name, setName] = useState('');
    const [email, setEmail] = useState(attemptedEmail);
    const [line1, setLine1] = useState(Utils.defaultAddress.line1);
    const [city, setCity] = useState(Utils.defaultAddress.city);
    const [stateProv, setStateProv] = useState(Utils.defaultAddress.state);
    const [postalCode, setPostalCode] = useState(Utils.defaultAddress.postalCode);
    const [testClock, setTestClock] = useState(false);

    const [customer, setCustomer] = useRecoilState(customerAtom);

    const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);
    const [formValid, setFormValid] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Check if email is already registered to another user
    useEffect(() => {
        if (email === undefined || !Utils.isValidEmail(email)) return;
        setEmailAlreadyRegistered(false);
        fetch('/customers/' + email)
            .then(res => res.json())
            .then(obj => {
                setEmailAlreadyRegistered(obj.id !== '');
            });
    }, [email]);

    // Create the customer and then set our login token and customer atom
    const createCustomer = (e) => {
        e.preventDefault();
        setProcessing(true);
        fetch("/customers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                line1: line1,
                city: city,
                state: stateProv,
                postal_code: postalCode,
                testClock: testClock
            })
        })
            .then(res => res.json())
            .then(data => {
                setProcessing(false);
                setCustomer(data);
                window.history.replaceState('', '', '/');
            });
    }

    useEffect(() => {
        setFormValid(name !== '' && email !== '' && Utils.isValidEmail(email) && !emailAlreadyRegistered)
    }, [name, email, emailAlreadyRegistered]);

    return (
        <div className="row justify-content-center">
            <form className="col-6 mt-5" onSubmit={createCustomer}>
                <div className="row mb-3">
                    <div className="col-6">
                        <label>Name</label>
                        <input className="form-control" onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="col-6">
                        <label>Email</label>
                        <input className="form-control" defaultValue={attemptedEmail} onChange={e => setEmail(e.target.value)} />
                        {emailAlreadyRegistered && <small className="form-text error">This email is already registered</small>}
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label>Street Address</label>
                        <input className="form-control" onChange={e => setLine1(e.target.value)} defaultValue={Utils.defaultAddress.line1} />
                    </div>
                    <div className="col-6">
                        <label>City</label>
                        <input className="form-control" onChange={e => setCity(e.target.value)} defaultValue={Utils.defaultAddress.city} />
                    </div>
                </div>
                <div className="row mb-4">
                    <div className="col-6">
                        <label>State</label>
                        <input className="form-control" onChange={e => setStateProv(e.target.value)} defaultValue={Utils.defaultAddress.state} />
                    </div>
                    <div className="col-6">
                        <label>Postal Code</label>
                        <input className="form-control" onChange={e => setPostalCode(e.target.value)} defaultValue={Utils.defaultAddress.postalCode} />
                    </div>
                </div>
                <div className="row mb-5 ms-1">
                    <div className="col form-switch">
                        <input className="form-check-input" type="checkbox" onChange={e => setTestClock(e.target.checked)} />
                        <label className="ms-3">Create test clock to test billing scenarios</label>
                    </div>
                </div>

                <div className="mb-3 ">
                    <button className="form-control btn btn-primary" disabled={!formValid || customer.id || processing} type="submit">
                        <span id="button-text">
                            {processing ? "Registering..." : "Register"}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    )
}
