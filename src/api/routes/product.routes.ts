import { Router } from 'express'
import { productController } from '../controllers/product.controller'

const router = Router()

// POST /api/products - Tạo product mới
router.post('/', productController.createProduct)

// GET /api/products - Lấy danh sách products (có filters và pagination)
router.get('/', productController.getAllProducts)

// GET /api/products/stats - Lấy thống kê products
router.get('/stats', productController.getProductStats)

// GET /api/products/categories - Lấy tất cả categories
router.get('/categories', productController.getAllCategories)

// GET /api/products/brands - Lấy tất cả brands
router.get('/brands', productController.getAllBrands)

// GET /api/products/search - Tìm kiếm products sử dụng Elasticsearch
router.get('/search', productController.searchProducts)

// GET /api/products/search-by-name - Tìm kiếm products theo tên (PostgreSQL)
router.get('/search-by-name', productController.searchProductsByName)

// GET /api/products/category/:category - Lấy products theo category
router.get('/category/:category', productController.getProductsByCategory)

// GET /api/products/brand/:brand - Lấy products theo brand
router.get('/brand/:brand', productController.getProductsByBrand)

// GET /api/products/:id - Lấy product theo ID
router.get('/:id', productController.getProductById)

// PUT /api/products/:id - Cập nhật product
router.put('/:id', productController.updateProduct)

// DELETE /api/products/:id - Xóa product
router.delete('/:id', productController.deleteProduct)

export default router
