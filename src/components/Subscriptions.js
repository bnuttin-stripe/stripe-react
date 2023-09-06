import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import { useRecoilValue, useRecoilState } from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';

import PM from './PM';
//import Wallet from './Wallet';
import * as Utils from '../utilities';
import { customerAtom, refresherAtom } from '../data/atoms';

// Display a customer's subscriptions, and allow them to change the payment method
// Atoms:
//      customerAtom: the customer object [required]
//      refresherAtom: the refresher object [optional]
// Props:
//      canEditPM: allow editing the PM on a subscription [optional - default no]

export default function Subscriptions(props) {
  // Atoms
  const customer = useRecoilValue(customerAtom);
  const [refresher, setRefresher] = useRecoilState(refresherAtom);
  
  // Component data
  const [isLoaded, setIsLoaded] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);

  // Subscription update
  const [showModal, setShowModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState({});
  const [selectedPM, setSelectedPM] = useState();
  const [processing, setProcessing] = useState(false);

  const refreshSubscriptions = () => {
    setRefresher(prevState => {
      return { ...prevState, payments: Math.random() }
    })
  }

  // Load all subscriptions
  useEffect(() => {
    setIsLoaded(false);
    fetch('/subscriptions/' + customer.id)
      .then(res => res.json())
      .then(obj => {
        setSubscriptions(obj);
        setIsLoaded(true);
      });
  }, [refresher.subscriptions]);

  // Updating a sub's PM
  const updateSub = () => {
    setProcessing(true);
    fetch('/subscription-update', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        subscription: selectedSub?.id,
        pm: selectedPM
      })
    })
      .then(res => res.json())
      .then(data => {
        setProcessing(false);
        refreshSubscriptions();
        closeModal();
      });
  }

  // Handle modal open/close
  const openModal = (e) => {
    e.preventDefault();
    subscriptions.forEach(sub => {
      if (sub.id === e.currentTarget.id)
        setSelectedSub(sub);
    })
    setShowModal(true);
  }
  
  const closeModal = () => {
    setSelectedSub({});
    setSelectedPM();
    setShowModal(false);
  }

  return (
    <>
      <div className="row">
        <h4 className="mb-2">Your subscriptions</h4>
      </div>
      <div className="row">
        <div className="col shadow-table">
          <Table borderless>
            <thead >
              <tr>
                <th>Subscription</th>
                <th>Price</th>
                <th>Payment Method</th>
                <th>Change</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!isLoaded && <tr><td><FontAwesomeIcon icon={faSpinner} className='spinner' />&nbsp;Loading</td></tr>}
              {isLoaded && subscriptions.length === 0 && <tr><td>No data</td></tr>}
              {isLoaded && subscriptions.map((subscription, key) => (
                <tr key={key}>
                  <td>{subscription.plan.product.name}</td>
                  <td>{Utils.displayPrice(subscription.plan.amount/100, 'usd')}/{subscription.plan.interval}</td>
                  <td>{subscription.default_payment_method &&
                    <PM pm={subscription.default_payment_method}/>
                  }</td>
                  <td ><FontAwesomeIcon icon={faEdit} onClick={openModal} id={subscription.id} /></td>
                  <td>
                    {subscription.status === 'incomplete' && <span className="badge badge-red rounded-pill">Incomplete</span>}
                    {subscription.status === 'incomplete_expired' && <span className="badge badge-red rounded-pill">Expired</span>}
                    {subscription.status === 'trialing' && <span className="badge badge-blue rounded-pill">Trialing</span>}
                    {subscription.status === 'active' && <span className="badge badge-green rounded-pill">Active</span>}
                    {subscription.status === 'past_due' && <span className="badge badge-red rounded-pill">Past Due</span>}
                    {subscription.status === 'canceled' && <span className="badge badge-silver rounded-pill">Canceled</span>}
                    {subscription.status === 'unpaid' && <span className="badge badge-red rounded-pill">Unpaid</span>}
                  </td>
                </tr>)
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <Modal show={showModal} centered onHide={closeModal} >
        <Modal.Header>
          <h4>Update Your Subscription</h4>
          <FontAwesomeIcon icon={faTimes} style={{ cursor: 'pointer' }} onClick={closeModal} />
        </Modal.Header>

        <Modal.Body>
          <div>Pick a new payment method for your subscription. This will take effect on your next billing cycle.</div>
          {/* <Wallet
            token={props.token}
            selectable={true}
            selectedPM={selectedPM}
            setSelectedPM={setSelectedPM}
            canAdd={false}
            cantSelect={selectedSub?.default_payment_method?.id}
          /> */}
          <button className="btn btn-primary" disabled={processing} onClick={updateSub}>
            {processing ? "Updating Payment Method..." : "Update Payment Method"}
          </button>
        </Modal.Body>
      </Modal>
    </>
  );

}



