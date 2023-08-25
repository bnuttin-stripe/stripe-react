import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { customerAtom, refresherAtom } from '../data/atoms';

export default function Test(props) {
    const refresher = useRecoilValue(refresherAtom);

    return (
        <>
            <div className="row">
                <h4>TEST: {refresher.test}</h4>
                <h3>{props.hello}</h3>
            </div>
        </>
    );

}

Test.defaultProps = {
    hello: "world",
};



