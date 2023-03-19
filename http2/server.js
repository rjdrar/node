// Node.js program to demonstrate the
// close event method

const http2 = require('http2');
const fs = require('fs');

// Private key and public certificate for access
const options = {
    key: fs.readFileSync('snakeoil.key'),
    cert: fs.readFileSync('snakeoil.pem'),
};

// Creating and initializing server
// by using http2.createServer() method
const server = http2.createSecureServer(options);

server.on('stream', (stream, requestHeaders) => {
    stream.respond({
        ':status': 200,
        'content-type': 'text/plain'
    });

    stream.write('hello ');

// Getting session object
// by using session method
    const http2session = stream.session;

// Getting alpnProtocol of this session
// by using alpnProtocol method
    const alpnProtocol = http2session.alpnProtocol;

    stream.end("session protocol : " + alpnProtocol);

    http2session.close();

// Handling 'close' event
    http2session.on('close',() => {
        console.log("session is closed");
    })

// Stopping the server
// by using the close() method
    server.close(() => {
        console.log("server destroyed");
    })
});

server.listen(8443);

// Creating and initializing client
// by using tls.connect() method
const client = http2.connect(
    'https://localhost:8443');

const req = client.request({
    ':method': 'GET', ':path': '/' });

req.on('response', (responseHeaders) => {
    console.log("status : "
        + responseHeaders[":status"]);
});

req.on('data', (data) => {
    console.log('Received: %s ',
        data.toString().replace(/(\n)/gm,""));
});

req.on('end', () => {
    client.close(() => {
        console.log("client destroyed");
    })
});
