const http = require("http"),
      fs=require('fs')

const host = 'localhost';
const port = 8000;

const requestListener = function (req, res) {
//    res.setHeader("Content-Type", "application/json");
//    res.writeHead(200);
//    res.end(`{"message": "This is a JSON response"}`);

    if (req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/html" })
        res.end('culo')
//        fs.createReadStream("./public/form.html", "UTF-8").pipe(res);
    } else if (req.method === "POST") {
        let body = ""
        req.on("data", chunk => {
            body += chunk
            })

        req.on("end", () => {
            console.log(req.body)
            res.writeHead(200, { "Content-Type": "text/html" })
            res.end('culo post')
        })
    }
}

const server = http.createServer(requestListener)

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
    })


