import TestRunner from 'test-runner'
import fetch from 'node-fetch'
import assert from 'assert'
import WsCli from '../lib/cli-app.mjs'
import * as fsMain from 'fs'
import path from 'path'
import currentModulePaths from 'current-module-paths'
const { __dirname } = currentModulePaths(import.meta.url)
const fs = fsMain.promises

const a = assert.strict
const tom = new TestRunner.Tom({ maxConcurrency: 1 })

tom.test('simple', async function () {
  const port = 7500 + this.index
  const cli = new WsCli({ logError: function () {} })
  const server = await cli.start(['--port', `${port}`])
  const response = await fetch(`http://127.0.0.1:${port}/package.json`)
  server.close()
  a.equal(response.status, 200)
})

tom.test('bad option', async function () {
  const exitCode = process.exitCode
  const cli = new WsCli({ logError: function () {} })
  const server = await cli.start(['--should-fail'])
  if (!exitCode) process.exitCode = 0
  a.equal(server, undefined)
})

tom.test('--help', async function () {
  const cli = new WsCli({ log: function () {} })
  await cli.start(['--help'])
})

tom.test('--version', async function () {
  let logMsg = ''
  const cli = new WsCli({ log: function (msg) { logMsg = msg } })
  await cli.start(['--version'])
  const version = JSON.parse(await fs.readFile(path.resolve(__dirname, '..', 'package.json'), 'utf8')).version
  a.equal(logMsg.trim(), version)
})

tom.test('default-stack', async function () {
  let logMsg = ''
  const cli = new WsCli({ log: function (msg) { logMsg = msg } })
  await cli.start(['--default-stack'])
  a.ok(/lws-static/.test(logMsg))
})

export default tom
