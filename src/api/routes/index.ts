import { Application } from 'express'
import userRoutes from './user.routes'
import productRoutes from './product.routes'

const routes = (app: Application) => {
  // User routes
  app.use('/api/users', userRoutes)
  
  // Product routes
  app.use('/api/products', productRoutes)
}

export default routes
