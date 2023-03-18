const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./database/ig.db')
const sql1=`
 CREATE TABLE IF NOT EXISTS handles (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    handle NVARCHAR(80) NOT NULL UNIQUE,
    description TEXT
    );
`
const sql2=`
 CREATE TABLE IF NOT EXISTS track (
    handle_id INTEGER,
    posts INTEGER,
    followers INTEGER,
    following INTEGER,
    last_post TEXT,
    updated TIMESTAMP
    );
`
db.run(sql1)
db.run(sql2)


