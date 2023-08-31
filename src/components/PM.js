import React from 'react';
import Amex from '../img/pms/amex.png';
import Diners from '../img/pms/diners.png';
import Discover from '../img/pms/discover.png';
import JCB from '../img/pms/jcb.png';
import Mastercard from '../img/pms/mastercard.png';
import UnionPay from '../img/pms/unionpay.png';
import Visa from '../img/pms/visa.png';
import Bank from '../img/pms/bank.png';

import '../styles/pms.css';

// Display a payment method's details
// Atoms:
//      None
// Props:
//      pm: the payment method object [required]

export default function PM(props) {
    return (
        <>
            <div className='pm align-items-center'>
                {props.pm.type === 'card' &&
                    <>
                        <div className="icon">
                            {props.pm.card.brand === 'amex' && <img src={Amex} alt="logo" />}
                            {props.pm.card.brand === 'diners' && <img src={Diners} alt="logo" />}
                            {props.pm.card.brand === 'discover' && <img src={Discover} alt="logo" />}
                            {props.pm.card.brand === 'jcb' && <img src={JCB} alt="logo" />}
                            {props.pm.card.brand === 'mastercard' && <img src={Mastercard} alt="logo" />}
                            {props.pm.card.brand === 'unionpay' && <img src={UnionPay} alt="logo" />}
                            {props.pm.card.brand === 'visa' && <img src={Visa} alt="logo" />}
                        </div>
                        <div><code>**** {props.pm.card.last4} exp. {props.pm.card.exp_month}/{props.pm.card.exp_year.toString().slice(-2)}</code></div>
                    </>
                }
                {props.pm.type === 'us_bank_account' &&
                    <>
                        <div className="icon">
                            <img src={Bank} alt="logo" />
                        </div>
                        <div><code>{props.pm.us_bank_account.bank_name} **** {props.pm.us_bank_account.last4}</code></div>
                    </>
                }
            </div>
        </>
    )

}