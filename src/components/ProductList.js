import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faReceipt } from '@fortawesome/free-solid-svg-icons';

import Product from './Product';
import { refresherAtom } from '../data/atoms';

// Display an account's products
// Atoms:
//      refresherAtom: the refresher object [optional]
// Props:
//      None

export default function ProductList(props) {
    // Atoms
    const refresher = useRecoilValue(refresherAtom);

    // Component data
    const [isLoaded, setIsLoaded] = useState(false);
    const [products, setProducts] = useState([]);
    const [showSubs, setShowSubs] = useState(true);

    // Load all products
    useEffect(() => {
        setIsLoaded(false);
        setProducts([]);
        fetch('/products')
            .then(res => res.json())
            .then(obj => {
                setProducts(obj);
                setIsLoaded(true);
            });
    }, [refresher.products]);

    if (!isLoaded) {
        return '';
    }
    else {
        return (
            <>
                <div className="row">
                    <div className="col mb-5">
                        <button className="btn btn-primary" disabled={showSubs} onClick={e => setShowSubs(true)}>Show Subscriptions</button>
                        <button className="btn btn-primary" disabled={!showSubs} onClick={e => setShowSubs(false)} style={{ marginLeft: 10 }}>Show Products</button>
                    </div>
                </div>
                {!isLoaded && <tr><td><FontAwesomeIcon icon={faSpinner} className='spinner' />&nbsp;Loading</td></tr>}
                {isLoaded && products.length === 0 && <tr><td>No data</td></tr>}
                <div className="row row-cols-1 row-cols-lg-3 g-3">
                    {isLoaded && products.map((product, key) => (
                        //!product.metadata.hide && ((showSubs && product.is_subscription) || (!showSubs && !product.is_subscription)) &&
                        <Product
                            product={product}
                            key={key}
                            layout='vertical'
                        />
                    ))}
                </div>
                
            </>
        );
    }
}


