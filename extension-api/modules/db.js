const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./database/sqlite.db')

const sql1=`
 CREATE TABLE IF NOT EXISTS handles (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    handle NVARCHAR(80) NOT NULL UNIQUE,
    description TEXT
    );
`
const sql2=`
 CREATE TABLE IF NOT EXISTS tracks (
    handle_id INTEGER,
    posts INTEGER,
    followers INTEGER,
    following INTEGER,
    last_post TEXT,
    updated TIMESTAMP
    );
`

const createDB=()=> {
    db.run(sql1)
    db.run(sql2)
}

const truncateDB=(table='tracks',cb)=>{
    console.log('truncate',table)
    try {
        db.run('DROP TABLE tracks',err=>{
            if (table === 'handles')
                db.run('DROP TABLE handles',err=>{
                    createDB()
                    cb(null,'ok')
                })
            else cb(null,'ok')
        })
    } catch(e) {
        cb(e)
    }
}

const insertHandle=(handle,description,cb)=>{
    db.run('INSERT INTO handles(handle,description) VALUES(?,?)',
        [handle, description],
        function (err) {
            cb(err,this.lastID)
        })
}

const insertTrack=(handle_id,posts,followers,following,last_post,cb)=>{
//    console.log('insertTrack',handle_id,posts,followers,following,last_post,cb)
    let sql=`INSERT INTO 
                tracks (handle_id,posts,followers,following,last_post,updated) 
                VALUES(?,?,?,?,?,DateTime('now'))
            `
    db.run(sql,
        [handle_id,posts,followers,following,last_post],
        function(err) { cb(err,err || this.lastID) })
}

const getAllTracks=cb=>{
    db.all(`select handle,posts,followers,following,last_post,updated 
                from tracks inner join handles 
                on handles.id=tracks.handle_id`,cb)
}

const getAllHandles=cb=>{
    db.all(`select handle,description 
                from handles`,cb)
}

const getHandle=(handle,cb)=>{
    let sql = `SELECT * FROM handles WHERE handle  = ?`
    db.get(sql, [handle], (err, row) => cb(err, err || row))
}


module.exports={
    db,
    createDB,
    truncateDB,
    insertHandle,
    insertTrack,
    getAllTracks,
    getHandle,
    getAllHandles
}

