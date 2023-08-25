
import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Wrapper for the Stripe PaymentElement. Meant to be used in a modal.
// Atoms:
//      None
// Props:
//      closeModal: close the modal and do whatever else is needed on the parent component [required]
//      setPM: set the newly created payment method on the parent component [optional]

export default function SetupWrapper(props) {
    // Component data
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(false);

    // Stripe
    const stripe = useStripe();
    const elements = useElements();
    
    const submit = async () => {
        setProcessing(true);
        setError(false);
        const { setupIntent, error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: props.return_url
            },
            redirect: 'if_required'
        });

        setProcessing(false);

        if (error) {
            setError(error.message);
        } else {
            props.closeModal();
            if (props.setPM) props.setPM(setupIntent.payment_method);
        }
    }

    return (
        <div>
            <PaymentElement />
            {error && <div className="error mt-2">{error}</div>}
            <button className="btn btn-primary" disabled={processing} style={{marginTop: 20}} onClick={submit}>
                {processing ? "Processing..." : "Save"}
            </button>
            
        </div>
    );
}

