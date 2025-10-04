import { Request, Response } from 'express'
import { productService, CreateProductData, UpdateProductData, ProductFilters } from '../services/product.service'

export class ProductController {
  // Tạo product mới
  async createProduct(req: Request, res: Response) {
    try {
      const productData: CreateProductData = req.body

      // Validation cơ bản
      if (!productData.name || !productData.brand || !productData.price || !productData.category || !productData.color || !productData.size) {
        return res.status(400).json({
          success: false,
          message: 'Name, brand, price, category, color và size là bắt buộc'
        })
      }

      // Validation price
      if (productData.price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Giá sản phẩm phải lớn hơn 0'
        })
      }

      const product = await productService.createProduct(productData)

      return res.status(201).json({
        success: true,
        message: 'Tạo product thành công',
        data: product
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Lấy tất cả products
  async getAllProducts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      
      // Xây dựng filters từ query parameters
      const filters: ProductFilters = {}
      
      if (req.query.category) {
        filters.category = req.query.category as string
      }
      if (req.query.brand) {
        filters.brand = req.query.brand as string
      }
      if (req.query.color) {
        filters.color = req.query.color as string
      }
      if (req.query.size) {
        filters.size = req.query.size as string
      }
      if (req.query.minPrice) {
        filters.minPrice = parseFloat(req.query.minPrice as string)
      }
      if (req.query.maxPrice) {
        filters.maxPrice = parseFloat(req.query.maxPrice as string)
      }
      if (req.query.search) {
        filters.search = req.query.search as string
      }

      const result = await productService.getAllProducts(page, limit, filters)

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách products thành công',
        data: result.products,
        pagination: result.pagination,
        filters
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Lấy product theo ID
  async getProductById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        })
      }

      const product = await productService.getProductById(id)

      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin product thành công',
        data: product
      })
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy product'
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Tìm kiếm products sử dụng Elasticsearch
  async searchProducts(req: Request, res: Response) {
    try {
      const { q } = req.query
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Query tìm kiếm là bắt buộc'
        })
      }

      const result = await productService.searchProducts(q, page, limit)

      return res.status(200).json({
        success: true,
        message: 'Tìm kiếm products thành công',
        data: result.products,
        pagination: result.pagination,
        meta: {
          took: (result as any).took,
          maxScore: (result as any).maxScore
        }
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Tìm kiếm products theo tên (PostgreSQL fallback)
  async searchProductsByName(req: Request, res: Response) {
    try {
      const { name } = req.query
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      if (!name || typeof name !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Tên sản phẩm là bắt buộc'
        })
      }

      const result = await productService.searchProductsByName(name, page, limit)

      return res.status(200).json({
        success: true,
        message: 'Tìm kiếm products thành công',
        data: result.products,
        pagination: result.pagination
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Lấy products theo category
  async getProductsByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await productService.getProductsByCategory(category, page, limit)

      return res.status(200).json({
        success: true,
        message: 'Lấy products theo category thành công',
        data: result.products,
        pagination: result.pagination
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Lấy products theo brand
  async getProductsByBrand(req: Request, res: Response) {
    try {
      const { brand } = req.params
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await productService.getProductsByBrand(brand, page, limit)

      return res.status(200).json({
        success: true,
        message: 'Lấy products theo brand thành công',
        data: result.products,
        pagination: result.pagination
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Cập nhật product
  async updateProduct(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const updateData: UpdateProductData = req.body

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        })
      }

      // Validation price nếu có
      if (updateData.price !== undefined && updateData.price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Giá sản phẩm phải lớn hơn 0'
        })
      }

      const product = await productService.updateProduct(id, updateData)

      return res.status(200).json({
        success: true,
        message: 'Cập nhật product thành công',
        data: product
      })
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy product'
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Xóa product
  async deleteProduct(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        })
      }

      const result = await productService.deleteProduct(id)

      return res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy product'
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Lấy tất cả categories
  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await productService.getAllCategories()

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách categories thành công',
        data: categories
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Lấy tất cả brands
  async getAllBrands(req: Request, res: Response) {
    try {
      const brands = await productService.getAllBrands()

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách brands thành công',
        data: brands
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Lấy thống kê products
  async getProductStats(req: Request, res: Response) {
    try {
      const stats = await productService.getProductStats()

      return res.status(200).json({
        success: true,
        message: 'Lấy thống kê products thành công',
        data: stats
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Sync toàn bộ data từ PostgreSQL sang Elasticsearch
  async syncToElasticsearch(req: Request, res: Response) {
    try {
      const result = await productService.syncAllProductsToElasticsearch()

      return res.status(200).json({
        success: true,
        message: 'Sync data thành công',
        data: result
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }
}

export const productController = new ProductController()
