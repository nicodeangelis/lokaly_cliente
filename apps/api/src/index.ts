import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import qr from './routes/qr'
import push from './routes/push'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', qr)
app.use('/api', push)

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`API on :${port}`))
