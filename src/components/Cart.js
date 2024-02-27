import React, { useEffect, useState } from 'react';
import * as Utils from '../utilities';
import { useRecoilValue, useRecoilState } from 'recoil';
import { customerAtom, refresherAtom, cartAtom } from '../data/atoms';

export default function Cart(props) {
    const [cart, setCart] = useRecoilState(cartAtom);
    const [sortedCart, setSortedCart] = useState({});
    const [totalPrice, setTotalPrice] = useState();
    const [hasSubs, setHasSubs] = useState(false);
    
    const styles = {
        header: {
            marginBottom: 15
        },
        preview: {
            height: 80
        },
        item: {
            marginBottom: 20
        },
        panel: {
            borderRadius: 4,
            padding: '20px 20px 20px 20px',
            boxShadow: 'silver 0px 0px 6px 0px',
        }
    }

    useEffect(()=>{
        console.log(cart);
        let total = 0;
        let obj = {};
        let newCart = [];
        // Deduplicate cart into an object
        cart.forEach(item => {
            obj[item.id] = obj[item.id] || [];
            obj[item.id].push(item);
            total += item.prices[0].unit_amount;
            if (item.is_subscription !== null) setHasSubs(true);
        })
        // Run through object keys to get relevant data
        Object.entries(obj).forEach(([key,val]) => {
            newCart.push({
                id: key,
                name: val[0].name,
                amount: Utils.displayPrice(val[0].prices[0].unit_amount, 'usd'),
                image: val[0].images[0],
                quantity: val.length
            })
        })
        setSortedCart(newCart);
        setTotalPrice(total);
    }, [cart]);

    return (
        <>
            <h4 style={styles.header}>Your cart</h4>
            {sortedCart.length > 0 && <div style={styles.panel}>
                {sortedCart.map((item, key) => (
                    <div className="row" key={key} style={styles.item}>
                        <div className="col-2">
                            <img style={styles.preview} src={item.image} alt="product" />
                        </div>
                        <div className="col-8">
                            {item.name}
                        </div>
                        <div className="col-2" style={{textAlign: 'right'}}>
                            {item.quantity} x {item.amount}
                        </div>
                    </div>
                ))}
                <div className="row" style={{borderTop: '1px solid silver', paddingTop: 5}}>
                    <div className="col-10" style={{textAlign: 'right', fontWeight: 'bold'}}>Total</div>
                    <div className="col-2" style={{textAlign: 'right', fontWeight: 'bold'}}>{Utils.displayPrice(totalPrice, 'usd')} {hasSubs && '(today)'}</div>
                </div>
            </div>
            }
            {cart.length === 0 &&
                <div className="row"><div className="col">Your cart is empty</div></div>
            }
        </>

    )

}