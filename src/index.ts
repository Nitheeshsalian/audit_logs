import express, { Request, Response } from 'express'
import auditLogs from './routes/AuditLogs'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use('/logs', auditLogs)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!')
})

app.listen(port, () => {
  console.log(`Server running at ${port}`)
})
