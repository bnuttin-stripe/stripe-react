import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { useRecoilValue } from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faReceipt } from '@fortawesome/free-solid-svg-icons';

import PM from './PM';
import * as Utils from '../utilities';
import { customerAtom, refresherAtom } from '../data/atoms';

// Display a customer's payments
// Atoms:
//      customerAtom: the customer object [required]
//      refresherAtom: the refresher object [optional]
// Props:
//      None

export default function Payments(props) {
  // Atoms
  const customer = useRecoilValue(customerAtom);
  const refresher = useRecoilValue(refresherAtom);

  // Component data
  const [isLoaded, setIsLoaded] = useState(false);
  const [payments, setPayments] = useState([]);

  // Load all payments
  useEffect(() => {
    setIsLoaded(false);
    fetch('/payments/' + customer.id)
      .then(res => res.json())
      .then(obj => {
        setPayments(obj);
        setIsLoaded(true);
      });
  }, [refresher.payments]);

  return (
    <>
      <div className="row">
        <h4 className="mb-2">Your payments</h4>
      </div>
      <div className="row">
        <div className="shadow-table">
          <Table borderless >
            <thead >
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {!isLoaded && <tr><td><FontAwesomeIcon icon={faSpinner} className='spinner' />&nbsp;Loading</td></tr>}
              {isLoaded && payments.length === 0 && <tr><td>No data</td></tr>}
              {isLoaded && payments.map((payment, key) => (
                <tr key={key}>
                  <td>{Utils.displayDate(payment.created)}</td>
                  <td>{payment.description}</td>
                  <td>
                    {payment.latest_charge?.amount_refunded > 0
                      ? Utils.displayPrice((payment.amount) / 100, 'usd') + " (" + Utils.displayPrice((payment.latest_charge?.amount_refunded) / 100, 'usd') + " refunded)"
                      : Utils.displayPrice((payment.amount - payment.latest_charge?.amount_refunded) / 100, 'usd')}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {payment.latest_charge?.payment_method_details && <PM pm={payment.latest_charge?.payment_method_details} />}
                  </td>
                  <td>
                    {payment.status === 'canceled' && <span className="badge badge-silver">Canceled</span>}
                    {payment.status === 'processing' && <span className="badge badge-blue">Processing</span>}
                    {payment.status === 'succeeded' && payment.amount_received > 0 && (
                      payment.latest_charge?.amount_refunded === 0
                        ? <span className="badge badge-green rounded-pill">Succeeded</span>
                        : payment.latest_charge?.amount_refunded !== payment.latest_charge?.amount_captured
                          ? <span className="badge badge-blue rounded-pill">Partially refunded</span>
                          : <span className="badge badge-silver rounded-pill">Refunded</span>
                    )}

                    {payment.status === 'requires_payment_method' && <span className="badge badge-red rounded-pill">Requires Payment Method</span>}
                    {payment.status === 'requires_confirmation' && <span className="badge badge-red rounded-pill">Requires Confirmation</span>}
                    {payment.status === 'requires_action' && <span className="badge badge-red rounded-pill">Requires Action</span>}
                    {payment.status === 'requires_capture' && <span className="badge badge-blue rounded-pill">Funds on Hold</span>}
                  </td>
                  <td>
                    <a href={payment.latest_charge?.receipt_url} target='_blank' rel="noreferrer"><FontAwesomeIcon icon={faReceipt} /></a>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );

}



