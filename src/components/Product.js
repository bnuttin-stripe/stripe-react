import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faCircleMinus } from '@fortawesome/free-solid-svg-icons';

import { useRecoilValue, useRecoilState } from 'recoil';
import { customerAtom, refresherAtom, cartAtom } from '../data/atoms';

import * as Utils from '../utilities';

// Display a product's details
// Atoms:
//    refresherAtom: the refresher object [optional]
// Props:
//    product: the product object [required]

export default function Product(props) {
    // Atoms 
    const [cart, setCart] = useRecoilState(cartAtom);
    const [numInCart, setNumInCart] = useState();

    const addToCart = (e) => {
        e.preventDefault();
        setCart([...cart, props.product]);
    }

    const removeFromCart = (e) => {
        e.preventDefault();
        var arr = [...cart];
        let idx = cart.findIndex(x => x == props.product);
        arr.splice(idx, 1);
        setCart(arr);
    }

    useEffect(() => {
        setNumInCart(cart.filter(x => (x == props.product)).length);
    }, [cart]);

    const resetCart = () => {
        setCart([]);
    }


    return (
        <>

            <div className="col">
                <div className="card" style={{ minHeight: 200 }}>
                    <div className="card-body">
                        <Link to={'/product/' + props.product.id}>
                            <img src={props.product.images[0]} className="w-25 float-end ms-2" alt="product" />
                        </Link>
                        <p className="card-text fw-bold">{props.product.name}</p>
                        <p className="card-text">{props.product.description}

                        </p>
                        {!props.product.is_subscription && <>
                            {numInCart == 0
                                ? <p className="badge bg-primary" role="button" onClick={addToCart}>{Utils.displayPrice(props.product.prices[0].unit_amount / 100, 'usd')}</p>
                                : <p>
                                    <span className="badge bg-primary rounded-pill" onClick={removeFromCart}>-</span>
                                    <span className="fw-bold ms-2 me-2">{numInCart}</span>
                                    <span className="badge bg-primary rounded-pill" onClick={addToCart}>+</span>
                                </p>
                            }
                        </>}
                    </div>
                </div>
            </div>
        </>
    );
}

Product.defaultProps = {
    layout: 'vertical'
}