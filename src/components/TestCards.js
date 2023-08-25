import React, { useState } from 'react';
import Table from 'react-bootstrap/Table';
import { Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';

export default function TestCards(props) {
    const [open, setOpen] = useState(false);

    const styles = {
        toggle: {
            marginTop: 10,
            marginBottom: 10,
            cursor: 'pointer'
        }
    }

    return (
        <>
            {open && <div style={styles.toggle} onClick={() => setOpen(false)}>
                <FontAwesomeIcon icon={faChevronCircleUp} />&nbsp;
                Hide test cards
            </div>}
            {!open && <div style={styles.toggle} onClick={() => setOpen(true)}>
                <FontAwesomeIcon icon={faChevronCircleDown} />&nbsp;
                Show test cards
            </div>}
            <Collapse in={open}>
                <div>
                    <Table bordered >
                        <thead>
                            <tr>
                                <th>Brand</th>
                                <th>Number</th>
                                <th>Expiration</th>
                                <th>CVC</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Visa</td>
                                <td style={{ fontFamily: 'monospace' }}>4242424242424242</td>
                                <td>Any</td>
                                <td>Any</td>
                            </tr>
                            <tr>
                                <td>Mastercard</td>
                                <td style={{ fontFamily: 'monospace' }}>5555555555554444</td>
                                <td>Any</td>
                                <td>Any</td>
                            </tr>
                            <tr>
                                <td>Amex</td>
                                <td style={{ fontFamily: 'monospace' }}>371449635398431</td>
                                <td>Any</td>
                                <td>Any</td>
                            </tr>
                            <tr>
                                <td>3D Secure</td>
                                <td style={{ fontFamily: 'monospace' }}>4000002500003155</td>
                                <td>Any</td>
                                <td>Any</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </Collapse>
        </>
    )
}
