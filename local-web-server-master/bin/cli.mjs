#!/usr/bin/env node
import WsCli from '../lib/cli-app.mjs'
const cli = new WsCli({
    http2:true,
    key:'./cert/snakeoil.key',
    cert:'./cert/snakeoil.pem'
})
cli.start()
