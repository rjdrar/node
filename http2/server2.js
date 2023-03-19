
const http2 = require('http2')
const fs = require('fs')

const options = {
    key: fs.readFileSync('snakeoil.key'),
    cert: fs.readFileSync('snakeoil.pem'),
};


const server = http2.createSecureServer(options, (req, res) => {
    res.writeHead(200);
    res.end('hello from server 2\n');
})

// listen to 8443 as a convention for HTTPS
server.listen(8443)