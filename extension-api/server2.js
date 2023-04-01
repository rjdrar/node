const {truncateDB,insertHandle,insertTrack,getAllTracks,getHandle,getAllHandles}=require('./modules/db.js')

const http2Express = require('http2-express-bridge')
const express = require('express')
const http = require('http')
const http2 = require('http2')
const cors = require('cors')

const { readFileSync } = require('fs')

const path = require('path')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const fs = require("fs")

const is2=false
let app, server

if (is2) {
    const options = {
        key: fs.readFileSync('cert/snakeoil.key'),
        cert: fs.readFileSync('cert/snakeoil.pem'),
        allowHTTP1: true
    }
    app = http2Express(express)
    server = http2.createSecureServer(options, app)
} else {
    app = express()
    server = http.createServer(app)
}

// http://johnzhang.io/options-request-in-express
app.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    res.sendStatus(200)
})

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
})

//app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname,'./public')))
app.use(helmet())
app.use(limiter)
//app.use(cors)
//app.options('*', cors()) // include before other routes
app.get('/', function(req,res) {
    res.send('private')
//    res.sendFile(path.join(__dirname,'./public/form.html'))
})

const sendError=(res,err,extra='')=>res.send(JSON.stringify({error:err.message,extra:extra}))
const sendJSON=(res,json)=>{
//    console.log('sendJSON',json)
    res.send(JSON.stringify(json))
}

app.get('/tracks-csv',function(req,res) {
    getAllTracks((err,recs)=>{
        if (err) return sendError(res,err,'getAllTracks')

        let csv="handle\tposts\tfollowers\tfollowing\tlast_post\tupdated"

        recs.forEach(e=>{
            csv+="\n"+e.handle+"\t"+e.posts+"\t"+e.followers+"\t"+e.following+"\t"+e.last_post+"\t"+e.updated
        })


        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", "attachment; filename=track.tsv")
        res.status(200).end(csv)
    })
})

app.get('/tracks', (req,res) => {
    getAllTracks((err,recs)=>{
        if (err) return sendError(res,err,'getAllTracks')
        sendJSON(res,recs)
    })
})

app.get('/handles', (req,res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    getAllHandles((err,recs)=>{
        if (err) return sendError(res,err,'getAllHandles')
        sendJSON(res,recs)
    })
})

app.post('/track', (req,res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")

    let body=req.body
    const doInsertTrack = handle_id => insertTrack(
        handle_id,
        body.posts,
        body.followers,
        body.following,
        body.last_post,
        (err, track_id) => err ? sendError(res, err, 'doInsert') : sendJSON(res, {track_id: track_id})
    )

    console.log('body',body)
    getHandle(body.handle, (err, row) => {
        if (err)
            return sendError(res, err, 'getHandle 1')

        if (!row)
            insertHandle(body.handle,body.description,(err,id)=>{
                if (err)
                    return sendError(res, err, 'getHandle 2')
                doInsertTrack(id)
            })
        else
            doInsertTrack(row.id)
    })
})

app.post('/truncate-tracks', (req,res) => {
    truncateDB('tracks',err=>err?sendError(res,err,'truncate-tracks'):sendJSON(res,{result:'ok'}))
})

app.post('/truncate-handles', (req,res) => {
    truncateDB('handles',err=>err?sendError(res,err,'truncate-handles'):sendJSON(res,{result:'ok'}))
})

let port=is2?8443:3000
server.listen(port, () => {
    console.log("server listening on port: "+port)
})