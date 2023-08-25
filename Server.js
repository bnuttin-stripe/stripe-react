const express = require('express');
const app = express();
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));

const cors = require('cors');
app.use(cors());
require('dotenv').config();

const STRIPE_KEY = process.env.REACT_APP_SK;
const PORT = process.env.REACT_APP_PORT;
const BASE_URL = process.env.REACT_APP_BASE_URL;
const stripe = require('stripe')(STRIPE_KEY);

/* ------ CUSTOMER ------ */
// Get customer
app.get('/customers/:email', async (req, res) => {
    var output = {
        id: ''
    };
    const email = req.params.email;
    const customer = await stripe.customers.list({
        email: email
    });
    if (customer.data.length > 0) {
        output = customer.data[0]
    }
    res.send(output);
});


// Create customer
const createCustomer = async (email, name, line1, city, state, postalCode) => {
    const existingCustomer = await stripe.customers.list({
        email: email
    });

    if (existingCustomer.data.length > 0) return false;

    const testClock = await stripe.testHelpers.testClocks.create({
        frozen_time: Math.floor(Date.now() / 1000)
    });

    const newCustomer = await stripe.customers.create({
        name: name,
        email: email,
        test_clock: testClock.id,
        address: {
            line1: line1,
            city: city,
            state: state,
            country: 'US',
            postal_code: postalCode
        }
    });

    return (newCustomer);
}

app.post("/customers", async (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    const line1 = req.body.line1;
    const city = req.body.city;
    const state = req.body.state;
    const postalCode = req.body.postalCode;

    const customer = await createCustomer(email, name, line1, city, state, postalCode);
    res.send(customer);
});

/* ------ PAYMENT METHODS ------ */
// Get saved payment methods for a given customer
app.get('/payment-methods/:customerId', async (req, res) => {
    const customerId = req.params.customerId;
    const pms = await stripe.paymentMethods.list({
        customer: customerId
    });
    res.send(pms.data);
});

// Detach payment method
app.delete('/payment-methods/:paymentMethodId', async (req, res) => {
    const paymentMethodId = req.params.paymentMethodId;
    await stripe.paymentMethods.detach(paymentMethodId);
    res.sendStatus(200);
});

// Create a setup intent and return its secret
app.post('/setup-intents', async (req, res) => {
    const customerId = req.body.customerId;
    const intent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card', 'us_bank_account']
    });
    res.send({
        clientSecret: intent.client_secret
    });
})

/* ------ PAYMENTS ------ */
// Get all payments
app.get('/payments/:customerId', async (req, res) => {
    const customerId = req.params.customerId;
    const payments = await stripe.paymentIntents.list({
        customer: customerId,
        expand: [
            'data.payment_method',
            'data.invoice',
            'data.latest_charge'
        ],
        limit: 100
    });
    res.send(payments.data);
});

/* ------ SUBSCRIPTIONS ------ */
// Get all subscriptions for the customer
app.get('/subscriptions/:customerId', async (req, res) => {
    const customerId = req.params.customerId;
    const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        expand: [
            'data.default_payment_method',
            'data.latest_invoice.payment_intent.latest_charge',
            'data.plan.product',
            'data.schedule'
        ]
    });
    res.send(subscriptions.data);
});

// Get all invoices for the customer
app.get('/invoices/:customerId', async (req, res) => {
    const customerId = req.params.customerId;
    const invoices = await stripe.invoices.list({
        customer: customerId,
        expand: ['data.charge', 'data.payment_intent', 'data.payment_intent.payment_method']
    });
    res.send(invoices.data);
});

// Update the PM on a sub
app.post('/subscription-update/', async (req, res) => {
    const subscriptionId = req.body.subscriptionId;
    const pm = req.body.pm;
    const subscription = await stripe.subscriptions.update(
        id,
        { default_payment_method: pm }
    )
    res.send(subscription);
});

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT);