import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { useRecoilValue, useRecoilState } from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faReceipt } from '@fortawesome/free-solid-svg-icons';

import PM from './PM';
import * as Utils from '../utilities';
import { customerAtom, refresherAtom } from '../data/atoms';

// Display a customer's invoices
// Atoms:
//      customerAtom: the customer object [required]
//      refresherAtom: the refresher object [optional]
// Props:
//      None

export default function Invoices(props) {
  // Atoms
  const customer = useRecoilValue(customerAtom);
  const [refresher, setRefresher] = useRecoilState(refresherAtom);

  // Component data
  const [isLoaded, setIsLoaded] = useState(false);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    setIsLoaded(false);
    fetch('/invoices/' + customer.id)
      .then(res => res.json())
      .then(obj => {
        setInvoices(obj);
        setIsLoaded(true);
      });
  }, [refresher.invoices]);

  return (
    <>
      <div className="row">
        <h4 className="mb-2">Your invoices</h4>
      </div>
      <div className="row">
        <div className="shadow-table">
          <Table borderless >
            <thead >
              <tr>
                <th>Number</th>
                <th>Status</th>
                <th>Description</th>
                <th>Total</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {!isLoaded && <tr><td><FontAwesomeIcon icon={faSpinner} className='spinner' />&nbsp;Loading</td></tr>}
              {isLoaded && invoices.length === 0 && <tr><td>No data</td></tr>}
              {isLoaded && invoices.map((invoice, key) => (
                <tr key={key}>
                  <td style={{ whiteSpace: 'nowrap' }}><a href={invoice.hosted_invoice_url} target='_blank' rel="noreferrer">{invoice.number}</a></td>
                  <td>
                    {invoice.status === 'draft' && <span className="badge badge-silver">Draft</span>}
                    {invoice.status === 'open' && <span className="badge badge-blue">Open</span>}
                    {invoice.status === 'paid' && <span className="badge badge-green">Paid</span>}
                    {invoice.status === 'uncollectible' && <span className="badge badge-red">Uncollectible</span>}
                    {invoice.status === 'void' && <span className="badge badge-silver">Void</span>}
                  </td>
                  <td><ul>{invoice.lines.data.map((line, key) => (
                    <li key={key}>{line.description}</li>
                  ))}</ul>
                  </td>
                  <td>{Utils.displayPrice(invoice.total, 'usd')}</td>
                  <td>{Utils.displayDate(invoice.created)}</td>
                  <td>
                    {invoice.collection_method === 'charge_automatically' && invoice.payment_intent && invoice.payment_intent.payment_method &&
                      <PM pm={invoice.payment_intent.payment_method} mode='mini' />}
                    {(invoice.payment_intent?.status === 'requires_action' || invoice.payment_intent?.status === 'requires_payment_method') &&
                      <span style={{ backgroundColor: 'orange' }} className="badge">Requires Action</span>
                    }
                    {invoice.collection_method === 'send_invoice' &&
                      <div>Manual payment</div>
                    }
                  </td>
                  <td>
                    {invoice.invoice_pdf &&
                      <a href={invoice.invoice_pdf} target='_blank' rel="noreferrer"><FontAwesomeIcon icon={faReceipt} /></a>
                    }
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



