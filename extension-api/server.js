const {truncateDB,insertHandle,insertTrack,getAllTracks,getHandle,getAllHandles}=require('./modules/db.js')

const express = require('express')
const http = require('http')
const path = require('path')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()
const server = http.createServer(app)

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
})


app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname,'./public')))
app.use(helmet())
app.use(limiter)

app.get('/', function(req,res) {
    res.send('private')
//    res.sendFile(path.join(__dirname,'./public/form.html'))
})

const sendError=(res,err,extra='')=>res.send(JSON.stringify({error:err.message,extra:extra}))
const sendJSON=(res,json)=>res.send(JSON.stringify(json))

app.get('/track-csv',function(req,res) {
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
    getAllHandles((err,recs)=>{
        if (err) return sendError(res,err,'getAllHandles')
        sendJSON(res,recs)
    })
})

app.post('/track', (req,res) => {
    const doInsert = handle_id => insertTrack(
        handle_id,
        req.body.posts,
        req.body.followers,
        req.body.following,
        req.body.last_post,
        (err, track_id) => err ? sendError(res, err, 'doInsert') : sendJSON(res, {track_id: track_id})
    )

    getHandle(req.body.handle, (err, row) => {
        if (err)
            return sendError(res, err, 'getHandle 1')

        if (!row)
            insertHandle(req.body.handle,req.body.description,(err,id)=>{
                if (err)
                    return sendError(res, err, 'getHandle 2')
                doInsert(id)
            })
        else
            doInsert(row.id)
    })
})

app.post('/truncate-tracks', (req,res) => {
    truncateDB('track',err=>err?sendError(res,err,'clear-track'):sendJSON(res,{result:'ok'}))
})

app.post('/truncate-handles', (req,res) => {
    truncateDB('handles',err=>err?sendError(res,err,'clear-handles'):sendJSON(res,{result:'ok'}))
})


server.listen(3000, function(){
    console.log("server listening on port: 3000")
})