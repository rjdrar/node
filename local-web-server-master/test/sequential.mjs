import TestRunner from 'test-runner'
import LocalWebServer from 'local-web-server'
import assert from 'assert'
import WsCli from '../lib/cli-app.mjs'

const a = assert.strict
const tom = new TestRunner.Tom({ maxConcurrency: 1 })

let origCwd = ''

tom.test('before', async function () {
  origCwd = process.cwd()
  process.chdir('test/fixture/middleware')
})

tom.test('cli: middleware named "index.mjs"', async function () {
  let logMsg = ''
  const cli = new WsCli({ log: function (msg) { logMsg = msg } })
  await cli.start(['--stack', 'index.mjs', '--config'])
  a.ok(/TestMiddleware/.test(logMsg))
})

tom.test('basic', async function () {
  const port = 9100 + this.index
  const ws = await LocalWebServer.create({
    port: port,
    stack: 'index.mjs'
  })
  ws.server.close()
  a.strictEqual(ws.stack[0].constructor.name, 'TestMiddleware')
})

tom.test('after', async function () {
  process.chdir(origCwd)
})

export default tom
