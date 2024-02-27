import React, { useState, useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { customerAtom, refresherAtom, cartAtom } from '../data/atoms';

import ProductList from '../components/ProductList';
import Cart from '../components/Cart';

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
                    <ProductList buyable={true}/>
                    <Cart />
                    <br/>
                </div>
            </div>
        </>
    );
}