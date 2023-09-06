import React, { useState, useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { customerAtom, refresherAtom, cartAtom } from '../data/atoms';

import Products from '../components/Products';

export default function Catalog(props) {
    // Atoms
    const customer = useRecoilValue(customerAtom);
    const [refresher, setRefresher] = useRecoilState(refresherAtom);

    const refreshProducts = () => {
        setRefresher(s => ({ ...s, products: Math.random() }))
    }

    return (
        <>
            <div onClick={refreshProducts}>Refresh</div>
            <div className="row">
                <div className="col">
                    <Products buyable={true}/>
                    <br/>
                </div>
            </div>
        </>
    );
}