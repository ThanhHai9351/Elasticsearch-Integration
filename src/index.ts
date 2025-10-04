import { Request, Response } from "express"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import cors from "cors"
import routes from "./api/routes"
import { app, server } from "./socket/socket"
import { checkElasticsearchConnection, createProductsIndex } from "./elasticsearch/client"

dotenv.config()

const port: string | number = process.env.PORT || 5000

app.get("/api/status", (req: Request, res: Response) => {
  return res.send("Port is active!")
})

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:3000", "http://localhost:4200"],
    methods: ["*"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
routes(app)

server.listen(port, async () => {
  // Kiểm tra kết nối Elasticsearch
  const isConnected = await checkElasticsearchConnection()
  
  if (isConnected) {
    // Tạo index nếu chưa có
    try {
      await createProductsIndex()
    } catch (error) {
      console.error('❌ Error initializing Elasticsearch:', error)
    }
  }
  
  console.log(`Server is running on port ${port}`)
})
