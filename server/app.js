var sqlite3 = require('sqlite3').verbose();
var express = require('express');
var http = require('http');
var path = require("path");
var bodyParser = require('body-parser');
//var Json2csvParser = require('json2csv').Parser;
var helmet = require('helmet');
var rateLimit = require("express-rate-limit");

var app = express();
var server = http.createServer(app);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

var db = new sqlite3.Database('./database/ig.db');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));
app.use(helmet());
app.use(limiter);

app.get('/', function(req,res){
    res.sendFile(path.join(__dirname,'./public/form.html'));
});

app.post('/add_handle', function(req,res){
    db.serialize(()=>{
        db.run('INSERT INTO handles(handle,description) VALUES(?,?)', [req.body.handle, req.body.description], function(err) {
            if (err) {
                return console.log(err.message);
            }
            console.log("New handle has been added",this.lastID);
            res.send("New handle has been added into the database with ID = "+this.lastID+ " and Description = "+req.body.description);
        });

    });
});

const getHandleId=(handle,cb)=>{
    let sql = `SELECT id
           FROM handles
           WHERE handle  = ?`;

    db.get(sql, [handle], (err, row) => {
        if (err) {
            cb(err)
        } else {
            console.log('getHandleId', handle, row)
            cb(err, row ? row.id : 0)
        }
    })
}


app.post('/add_data', function(req,res){
    getHandleId(req.body.handle,(err,id)=>{
        if (err) {
            res.send(err.message)
            return
        }
        insertTrack(id,
            req.body.posts,
            req.body.followers,
            req.body.following,
            (err,track_id)=>{
                if (err) {
                    res.send(err.message)
                } else {
                    res.send("New track data has been added into the database with ID = " + track_id)
                }
            })
    })
})


app.get('/track-csv',function(req,res){
    db.all("select handle,posts,followers,following,last_post,updated from track inner join handles on handles.id=track.handle_id",
        function (err, recs) {
        if (err) throw err;

        let csv="handle\tposts\tfollowers\tfollowing\tlast_post\tupdated"
        recs.forEach(e=>{csv+="\n"+e.handle+"\t"+e.posts+"\t"+e.followers+"\t"+e.following+"\t"+e.last_post+"\t"+e.updated})

        /*
        const jsonRecs = JSON.parse(JSON.stringify(recs));
        console.log(jsonRecs);

        // -> Convert JSON to CSV data
        const csvFields = ['created', 'handle', 'posts', 'followers','following'];
        const json2csvParser = new Json2csvParser({ csvFields });
        const csv = json2csvParser.parse(jsonRecs);

        console.log(csv);
        */

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=track.tsv");
        res.status(200).end(csv);

    })
})


const insertTrack=(handle_id,posts,followers,following,last_post,cb)=>{
//    console.log('insertTrack',handle_id,posts,followers,following,last_post,cb)
    let sql=`INSERT INTO 
                track (handle_id,posts,followers,following,last_post,updated) 
                VALUES(?,?,?,?,?,DateTime('now'))
            `
    db.run(sql,
        [handle_id,posts,followers,following,last_post],
        function(err) { cb(err,err || this.lastID) })
}

const getHandle=(handle,cb)=>{
    let sql = `SELECT * FROM handles WHERE handle  = ?`
    db.get(sql, [handle], (err, row) => cb(err, err || row))
}

const sendError=(res,err,extra='')=>res.send(JSON.stringify({error:err.message,extra:extra}))
const sendJSON=(res,json)=>res.send(JSON.stringify(json))

app.post('/track', (req,res) => {
//    console.log('track',req.body)
    const ctx='/track '
    const doInsert = handle_id => insertTrack(
        handle_id,
        req.body.posts,
        req.body.followers,
        req.body.following,
        req.body.last_post,
        (err, track_id) => err ? sendError(res, err, ctx+'doInsert') : sendJSON(res, {track_id: track_id})
    )

    getHandle(req.body.handle, (err, row) => {
//        console.log('getHandle',req.body)
        if (err) return sendError(res, err, ctx+'getHandle')
        if (!row) {
            db.run('INSERT INTO handles(handle,description) VALUES(?,?)',
                [req.body.handle, req.body.description], function (err) {
                    if (err) return sendError(res, err, ctx+'getHandle 2')
                    doInsert(this.lastID)
                })
        } else {
            doInsert(row.id)
        }
    })
})


server.listen(3000, function(){
    console.log("server is listening on port: 3000")
})