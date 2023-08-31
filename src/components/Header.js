import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { customerAtom } from '../data/atoms';
import { Link } from 'react-router-dom';
import DatePicker from 'react-date-picker';

import Logo from '../img/Logo.svg';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle, faShoppingCart, faSpinner, faCalendar } from '@fortawesome/free-solid-svg-icons';

export default function Header(props) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [clock, setClock] = useState({});
    const [clockRefreshing, setClockRefreshing] = useState(false);
    const [customer, setCustomer] = useRecoilState(customerAtom);

    const logout = () => {
        setCustomer('');
        setClock({});
    }

    const getClock = async (clockId, initialLoad) => {
        if (clockId === undefined || clockId === '') return;
        if (initialLoad) setIsLoaded(false);
        setClockRefreshing(true);
        fetch('/test-clocks/' + customer.test_clock)
            .then(res => res.json())
            .then(obj => {
                // When we get an advancing clock, we keep GETting it until it's in ready state
                if (obj.status === 'advancing') {
                    getClock(clockId, initialLoad);
                }
                return obj;
            })
            .then(obj => {
                if (obj.status !== 'advancing') {
                    setClock(obj);
                    if (initialLoad) setIsLoaded(true);
                    setClockRefreshing(false);
                }
            });
    }

    const handleChange = async (value) => {
        const date = new Date(value);
        const seconds = date.getTime() / 1000;
        fetch("/test-clocks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: clock.id,
                timestamp: seconds,
            })
        })
            .then(res => res.json())
            .then(data => {
                getClock(clock.id, false);
            });
    }

    useEffect(() => {
        if (customer.test_clock) {
            getClock(customer.test_clock, true);
        }
    }, [customer.test_clock]);

    return (
        <>
            <div className='row align-items-end mt-4' style={{ marginBottom: 75 }}>
                <div className="col-6">
                    <Link to='/'>
                        <img src={Logo} className="logo" alt="icon" />
                    </Link>
                </div>
                {customer.id && <div className="col-6">
                    <div className="row justify-content-end">
                        <div className="col-auto">
                            {customer.name} ({customer.email})
                        </div>
                        {clock.id && <div className="col-auto" style={{marginTop: -4}}>
                            {clockRefreshing && <FontAwesomeIcon icon={faSpinner} className='spinner' style={{ marginRight: 10 }} />}
                            {isLoaded && 
                                <>
                                    <FontAwesomeIcon icon={faCalendar} className="faIcon" />
                                    <DatePicker
                                        clearIcon={null}
                                        className='datepicker'
                                        value={new Date(clock?.frozen_time * 1000)}
                                        minDate={new Date(clock?.frozen_time * 1000)}
                                        disabled={clockRefreshing}
                                        onChange={handleChange}
                                    />
                                </>
                            }
                        </div>}
                        <div className="col-auto" style={{marginTop: -4}}>
                            <FontAwesomeIcon icon={faSignOutAlt} onClick={logout} className="faIcon" />
                        </div>
                    </div>

                </div>
                }
            </div>
        </>
    )
}


