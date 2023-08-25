import React from 'react';
import { useRecoilState } from 'recoil';
import { customerAtom } from '../data/atoms';
import { Link } from 'react-router-dom';

import Logo from '../img/Logo.svg';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle, faShoppingCart, faSpinner, faCalendar } from '@fortawesome/free-solid-svg-icons';

export default function Header(props) {
    const logout = () => {
        setCustomer('');
    }

    const [customer, setCustomer] = useRecoilState(customerAtom);

    return (
        <>
            <div className='row align-items-end mt-4' style={{marginBottom: 75}}>
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
                        <div className="col-auto">
                            <FontAwesomeIcon icon={faSignOutAlt} onClick={logout} className="faIcon" />
                        </div>
                    </div>

                </div>
                }
            </div>
        </>
    )
}


