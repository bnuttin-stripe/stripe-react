import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { customerAtom, refresherAtom } from '../data/atoms';
import { JsonViewer } from '@textea/json-viewer';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import * as Utils from '../utilities';

const WS_URL = "ws://127.0.0.1:8082";

export default function Webhooks(props) {
    const refresher = useRecoilValue(refresherAtom);
    const [status, setStatus] = useState([]);
    const [lastUpdated, setLastUpdated] = useState();

    const { sendJsonMessage, readyState } = useWebSocket(WS_URL, {
        onOpen: () => {
            //console.log('WebSocket connection established.');
        },
        onMessage: (e) => {
            setStatus([JSON.parse(e.data), ...status]);
            setLastUpdated(new Date());
        },
        share: true,
        filter: () => false,
        retryOnError: true,
        shouldReconnect: () => true
    });

    return (
        <>
            <div className="row">
                <div className="col"><h4 className="mb-2">Webhooks</h4></div>
                <div className="col"><small className="text-muted float-end" style={{lineHeight:'34px'}}>Updated @ {lastUpdated.toLocaleTimeString('en-US')}</small></div>
            </div>
            <div className="row shadow-table" style={{maxHeight: 600, minHeight: 200, overflow: 'scroll'}}>
                {status.length == 0 && <p>Listening for events</p>}
                {status.length > 0 && status.map((row, key) => (
                    <><h6 className="mt-2">{row.type}</h6>
                        <JsonViewer
                            value={row}
                            key={key}
                            rootName="event"
                            quotesOnKeys={false}
                            displayDataTypes={false}
                            displaySize={false}
                            defaultInspectDepth={key == 0 ? 3 : 1}
                            style={{ fontSize: 11 }}
                        />
                    </>
                ))}
            </div>
        </>
    );

}




