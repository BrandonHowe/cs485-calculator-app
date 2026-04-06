const express = require('express')
const cors = require('cors')
const { calculate } = require('./calculator')

const app = express()
const PORT = Number(process.env.PORT || 5000)

app.use(cors())
app.use(express.json())

app.post('/api/calculate', (req, res) => {
  const { expression } = req.body || {}

  try {
    const result = calculate(expression)
    res.json({ result })
  } catch (error) {
    res.status(400).json({ error: error.message || 'Unable to evaluate expression' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Calculator backend listening on port ${PORT}`)
})

process.on('uncaughtException', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Start with PORT=<other> npm run dev or stop the existing process on ${PORT}.`)
    process.exit(1)
  }

  throw error
})
