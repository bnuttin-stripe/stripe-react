import React, { useState, useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { customerAtom, refresherAtom } from '../data/atoms';

import Wallet from '../components/Wallet';
import Payments from '../components/Payments';
import Webhooks from '../components/Webhooks';
import Subscriptions from '../components/Subscriptions';
import Invoices from '../components/Invoices';
import TestCards from '../components/TestCards';

export default function Profile(props) {
    // Atoms
    const customer = useRecoilValue(customerAtom);
    const [refresher, setRefresher] = useRecoilState(refresherAtom);

    const refreshPayments = () => {
        setRefresher(s => ({ ...s, payments: Math.random() }))
    }

    const refreshInvoices = () => {
        setRefresher(s => ({ ...s, invoices: Math.random() }))
    }

    const [selectedPM, setSelectedPM] = useState();


    return (
        <>
            <div className="row">
                <div className="col">
                    <Webhooks />
                </div>
            </div>
        </>
    );
}