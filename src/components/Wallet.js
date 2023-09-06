import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import { useRecoilState, useRecoilValue } from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTimes, faTrash, faUniversity } from '@fortawesome/free-solid-svg-icons';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from "@stripe/react-stripe-js";

import SetupWrapper from './SetupWrapper';
import PM from './PM';
import TestCards from './TestCards';
import { customerAtom, refresherAtom } from '../data/atoms';

// Display a customer's wallet, and allow them to add or remove payment methods
// Atoms:
//      customerAtom: the customer object [required]
//      refresherAtom: the refresher object [optional]
// Props:
//      canAdd: allow adding a PM [optional - default no]
//      selectable: allow selecting a PM [optional - default no]
//      selectedPM: if selectable, this is the ID of the currently selected payment method on the parent component [optional]
//      setSelectedPM: if selectable, this is the function to set the selected payment method on the parent component [optional]

export default function Wallet(props) {
    // Atoms
    const customer = useRecoilValue(customerAtom);
    const [refresher, setRefresher] = useRecoilState(refresherAtom);

    // Component data
    const [isLoaded, setIsLoaded] = useState(false);
    const [pms, setPMs] = useState([]);

    const refreshWallet = () => {
        setRefresher(s => ({ ...s, wallet: Math.random() }))
    }

    // Adding a PM
    const [showModal, setShowModal] = useState(false);


    // Load all PMs
    useEffect(() => {
        setIsLoaded(false);
        fetch('/payment-methods/' + customer.id)
            .then(res => res.json())
            .then(obj => {
                setPMs(obj);
                setIsLoaded(true);
            });
    }, [refresher.wallet]);

    // Set selected PM
    const togglePM = (e) => {
        props.setSelectedPM(props.selectedPM === e.currentTarget.id ? '' : e.currentTarget.id);
    }

    // Delete a PM from a customer's profile
    const detachPM = (paymentMethodId) => {
        fetch("/payment-methods/" + paymentMethodId, {
            method: "DELETE"
        })
            .then(res => {
                props.setSelectedPM('');
                refreshWallet();
            })
    }

    // Handle modal open/close
    const openModal = (e) => {
        e.preventDefault();
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
        refreshWallet();
        setElementsOptions({});
        setStripePromise(false);
    }

    // Stripe
    const [elementOptions, setElementsOptions] = useState({});
    const [stripePromise, setStripePromise] = useState(false);

    // Load Stripe on component load or refresh
    useEffect(() => {
        setStripePromise(
            loadStripe(process.env.REACT_APP_PK)
        );
    }, [refresher.wallet]);

    // Create setupIntent upon loading the modal
    useEffect(() => {
        if (showModal) {
            fetch('/setup-intents', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    customerId: customer.id
                })
            })
                .then(res => res.json())
                .then(data => {
                    setElementsOptions({ clientSecret: data.clientSecret });
                });
        }
    }, [showModal]);

    return (
        <>
            <div className="row">
                <h4 className="mb-2">Your wallet</h4>
            </div>
            <div className="row">
                <div className="shadow-table">
                    {(!isLoaded || pms === undefined) && <>
                        <FontAwesomeIcon icon={faSpinner} className='spinner' style={{ marginRight: 10 }} />&nbsp;
                        Loading
                    </>}
                    {isLoaded && pms !== undefined && <>
                        <Table borderless>
                            <tbody>
                                {pms.map((pm, key) => (
                                    <tr key={key}>
                                        <td>
                                            <div style={{ float: 'left', marginRight: 5 }}>
                                                <input type='radio'
                                                    id={pm.id}
                                                    checked={props.selectedPM === pm.id}
                                                    onChange={togglePM}
                                                />
                                            </div>
                                            <div style={{ float: 'left' }}>
                                                <PM pm={pm} />
                                            </div>
                                            <div style={{ float: 'right' }}>
                                                <FontAwesomeIcon icon={faTrash} style={{ cursor: 'pointer' }} onClick={(e) => detachPM(pm.id)} />
                                            </div>
                                        </td>
                                    </tr>))}
                            </tbody>
                        </Table>
                    </>}
                    {props.canAdd && <button className="btn btn-primary m-2 mb-3" onClick={openModal}>Add a payment method</button>}
                </div>
            </div>



            <Modal show={showModal} centered onHide={closeModal} >
                <Modal.Header  >
                    <h4>Add a payment method</h4>
                    <FontAwesomeIcon icon={faTimes} style={{ cursor: 'pointer' }} onClick={closeModal} />
                </Modal.Header>
                <Modal.Body>
                    {elementOptions.clientSecret &&
                        <Elements stripe={stripePromise} options={elementOptions} >
                            <SetupWrapper
                                return_url={process.env.REACT_APP_BASE_URL + '/'}
                                closeModal={closeModal}
                            />
                        </Elements>
                    }
                    <TestCards />
                </Modal.Body>
            </Modal>
        </>
    );
}