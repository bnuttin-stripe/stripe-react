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
const PORT_WS = process.env.REACT_APP_PORT_WS;
const BASE_URL = process.env.REACT_APP_BASE_URL;
const stripe = require('stripe')(STRIPE_KEY);

/* ------ CUSTOMER ------ */
// Get a test clock
app.get('/test-clocks/:id', async (req, res) => {
    const id = req.params.id;
    const testClock = await stripe.testHelpers.testClocks.retrieve(id);
    res.send(testClock);
});

// Advance test clock
app.post('/test-clocks', async (req, res) => {
    const id = req.body.id;
    const timestamp = req.body.timestamp;
    const testClock = await stripe.testHelpers.testClocks.advance(
        id,
        { frozen_time: timestamp }
    )
    res.send(testClock)
});

// Get customer
app.get('/customers/:email', async (req, res) => {
    const email = req.params.email;
    var output = {
        id: ''
    };

    // First we search through the test clocks
    const clocks = await stripe.testHelpers.testClocks.list({ limit: 100 })
    if (clocks.data.length > 0) {
        for (var i = 0; i < clocks.data.length; i++) {
            const customerTC = await stripe.customers.list({
                email: email,
                test_clock: clocks.data[i].id
            });
            if (customerTC.data.length > 0) {
                output = customerTC.data[0]
            }
        }
    }

    // If not found, we do a regular search
    if (output.id === '') {
        const customer = await stripe.customers.list({
            email: email
        })
        if (customer.data.length > 0) {
            output = customer.data[0]
        }
    }

    res.send(output);
});

// Create customer
const createCustomer = async (email, name, line1, city, state, postalCode, testClock) => {
    // const existingCustomer = await stripe.customers.list({
    //     email: email
    // });

    // if (existingCustomer.data.length > 0) return false;

    let payload = {
        name: name,
        email: email,
        address: {
            line1: line1,
            city: city,
            state: state,
            country: 'US',
            postal_code: postalCode
        }
    }

    if (testClock) {
        const testClock = await stripe.testHelpers.testClocks.create({
            frozen_time: Math.floor(Date.now() / 1000)
        });
        payload.test_clock = testClock.id
    }

    const newCustomer = await stripe.customers.create(payload);
    return (newCustomer);
}

app.post("/customers", async (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    const line1 = req.body.line1;
    const city = req.body.city;
    const state = req.body.state;
    const postalCode = req.body.postalCode;
    const testClock = req.body.testClock;

    const customer = await createCustomer(email, name, line1, city, state, postalCode, testClock);
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

/* ------ PRODUCTS ------ */
// Get all products
app.get('/products', async (req, res) => {
    let output = [];

    const products = await stripe.products.list({
        limit: 30,
        active: true
    });

    const prices = await stripe.prices.list({
        limit: 30,
        active: true
    });

    products.data.forEach(product => {
        product.prices = [];
        prices.data.forEach(price => {
            if (price.product === product.id) product.prices.push(price);
        })
        product.is_subscription = product.prices.findIndex(x => x.recurring !== null) > -1;
        output.push(product);
    });

    res.send(output);
});

// Get details and prices on a specific product
app.get('/products/:id', async (req, res) => {
    const id = req.params.id;
    const product = await stripe.products.retrieve(id);
    const prices = await stripe.prices.list({
        product: req.params.id,
        active: true,
    });
    product.prices = prices.data;
    product.is_subscription = product.prices.findIndex(x => x.recurring !== null) > -1;
    res.send({
        product
    });
});

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

app.get('/test', async (req, res) => {
    res.send("hello world");
});


/* ------ WEBSOCKET ------ */
const { WebSocket, WebSocketServer } = require('ws');
const http = require('http');
const uuidv4 = require('uuid').v4;

// Spinning the http server and the WebSocket server.
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
server.listen(PORT_WS, () => {
    console.log(`WebSocket server is running on port ${PORT_WS}`);
});

const clients = {};
// I'm maintaining all active users in this object
const users = {};
// The current editor content is maintained here.
let editorContent = null;
// User activity history.
let userActivity = [];

const typesDef = {
    USER_EVENT: 'userevent',
    CONTENT_CHANGE: 'contentchange'
  }

wsServer.on('connection', function (connection) {
    // Generate a unique code for every user
    const userId = uuidv4();
    console.log('Recieved a new connection');

    // Store the new connection and handle messages
    clients[userId] = connection;
    console.log(`${userId} connected.`);
    connection.on('message', (message) => handleMessage(message, userId));
    // User disconnected
    connection.on('close', () => handleDisconnect(userId));
});


function broadcastMessage(json) {
    // We are sending the current data to all connected clients
    const data = JSON.stringify(json);
    for (let userId in clients) {
        let client = clients[userId];
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    };
}

function handleMessage(message, userId) {
    const dataFromClient = JSON.parse(message.toString());
    const json = { type: dataFromClient.type };
    if (dataFromClient.type === typesDef.USER_EVENT) {
      users[userId] = dataFromClient;
      userActivity.push(`${dataFromClient.username} joined to edit the document`);
      json.data = { users, userActivity };
    } else if (dataFromClient.type === typesDef.CONTENT_CHANGE) {
      editorContent = dataFromClient.content;
      json.data = { editorContent, userActivity };
    }
    broadcastMessage(json);
  }

function handleDisconnect(userId) {
    console.log(`${userId} disconnected.`);
    const json = { type: typesDef.USER_EVENT };
    const username = users[userId]?.username || userId;
    userActivity.push(`${username} left the document`);
    json.data = { users, userActivity };
    delete clients[userId];
    delete users[userId];
    broadcastMessage(json);
}

/* ------ WEBHOOKS ------ */
app.post('/webhooks', async (req, res) => {
    console.log("Hello")
    const event = req.body;
    console.log(event.type)
    const obj = event.data.object;
    broadcastMessage(event);

    switch (event.type) {
        case 'payment_intent.succeeded':
            res.sendStatus(200);
            break;
        default:
            res.sendStatus(200);
            break;
    }

});



app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT);





