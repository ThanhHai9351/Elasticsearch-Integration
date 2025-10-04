import { prisma } from '../../db/prisma'
import { esClient } from '../../elasticsearch/client'

export interface CreateProductData {
  name: string
  brand: string
  price: number
  category: string
  color: string
  size: string
  description?: string
}

export interface UpdateProductData {
  name?: string
  brand?: string
  price?: number
  category?: string
  color?: string
  size?: string
  description?: string
}

export interface ProductFilters {
  category?: string
  brand?: string
  color?: string
  size?: string
  minPrice?: number
  maxPrice?: number
  search?: string
}

const INDEX_NAME = "products"

export class ProductService {
  // Tạo product mới
  async createProduct(data: CreateProductData) {
    try {
      // 1️⃣ Lưu vào PostgreSQL (nguồn thật)
      const product = await prisma.product.create({
        data
      })

      // 2️⃣ Đồng bộ sang Elasticsearch (phụ)
      try {
        await esClient.index({
          index: INDEX_NAME,
          id: product.id.toString(),
          body: {
            name: product.name,
            brand: product.brand,
            price: product.price,
            category: product.category,
            color: product.color,
            size: product.size,
            description: product.description,
            createdAt: product.createdAt,
          },
        })
      } catch (esError) {
        console.error('Elasticsearch sync error:', esError)
        // Không throw error để không ảnh hưởng đến việc tạo product
      }
      
      return product
    } catch (error) {
      throw new Error(`Error creating product: ${error}`)
    }
  }

  // Lấy tất cả products với filters và pagination
  async getAllProducts(
    page: number = 1, 
    limit: number = 10, 
    filters: ProductFilters = {}
  ) {
    try {
      const skip = (page - 1) * limit
      
      // Xây dựng where clause từ filters
      const where: any = {}
      
      if (filters.category) {
        where.category = { contains: filters.category, mode: 'insensitive' }
      }
      
      if (filters.brand) {
        where.brand = { contains: filters.brand, mode: 'insensitive' }
      }
      
      if (filters.color) {
        where.color = { contains: filters.color, mode: 'insensitive' }
      }
      
      if (filters.size) {
        where.size = { contains: filters.size, mode: 'insensitive' }
      }
      
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {}
        if (filters.minPrice !== undefined) {
          where.price.gte = filters.minPrice
        }
        if (filters.maxPrice !== undefined) {
          where.price.lte = filters.maxPrice
        }
      }
      
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { brand: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
      
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.product.count({ where })
      ])

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      throw new Error(`Error fetching products: ${error}`)
    }
  }

  // Lấy product theo ID
  async getProductById(id: number) {
    try {
      const product = await prisma.product.findUnique({
        where: { id }
      })

      if (!product) {
        throw new Error('Product not found')
      }

      return product
    } catch (error) {
      throw new Error(`Error fetching product: ${error}`)
    }
  }

  // Tìm kiếm products theo tên
  async searchProductsByName(name: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit
      
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: {
            name: {
              contains: name,
              mode: 'insensitive'
            }
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.product.count({
          where: {
            name: {
              contains: name,
              mode: 'insensitive'
            }
          }
        })
      ])

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      throw new Error(`Error searching products: ${error}`)
    }
  }

  // Lấy products theo category
  async getProductsByCategory(category: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit
      
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: {
            category: {
              contains: category,
              mode: 'insensitive'
            }
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.product.count({
          where: {
            category: {
              contains: category,
              mode: 'insensitive'
            }
          }
        })
      ])

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      throw new Error(`Error fetching products by category: ${error}`)
    }
  }

  // Lấy products theo brand
  async getProductsByBrand(brand: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit
      
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: {
            brand: {
              contains: brand,
              mode: 'insensitive'
            }
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.product.count({
          where: {
            brand: {
              contains: brand,
              mode: 'insensitive'
            }
          }
        })
      ])

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      throw new Error(`Error fetching products by brand: ${error}`)
    }
  }

  // Cập nhật product
  async updateProduct(id: number, data: UpdateProductData) {
    try {
      // 1️⃣ Cập nhật trong PostgreSQL (nguồn thật)
      const product = await prisma.product.update({
        where: { id },
        data
      })

      // 2️⃣ Đồng bộ sang Elasticsearch (phụ)
      try {
        await esClient.index({
          index: INDEX_NAME,
          id: product.id.toString(),
          body: {
            name: product.name,
            brand: product.brand,
            price: product.price,
            category: product.category,
            color: product.color,
            size: product.size,
            description: product.description,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
          },
        })
      } catch (esError) {
        console.error('Elasticsearch sync error:', esError)
        // Không throw error để không ảnh hưởng đến việc update product
      }

      return product
    } catch (error) {
      throw new Error(`Error updating product: ${error}`)
    }
  }

  // Xóa product
  async deleteProduct(id: number) {
    try {
      // 1️⃣ Xóa từ PostgreSQL (nguồn thật)
      await prisma.product.delete({
        where: { id }
      })

      // 2️⃣ Xóa từ Elasticsearch (phụ)
      try {
        await esClient.delete({
          index: INDEX_NAME,
          id: id.toString()
        })
      } catch (esError) {
        console.error('Elasticsearch delete error:', esError)
        // Không throw error để không ảnh hưởng đến việc xóa product
      }

      return { message: 'Product deleted successfully' }
    } catch (error) {
      throw new Error(`Error deleting product: ${error}`)
    }
  }

  // Lấy tất cả categories
  async getAllCategories() {
    try {
      const categories = await prisma.product.findMany({
        select: {
          category: true
        },
        distinct: ['category'],
        orderBy: {
          category: 'asc'
        }
      })

      return categories.map((item: any) => item.category)
    } catch (error) {
      throw new Error(`Error fetching categories: ${error}`)
    }
  }

  // Lấy tất cả brands
  async getAllBrands() {
    try {
      const brands = await prisma.product.findMany({
        select: {
          brand: true
        },
        distinct: ['brand'],
        orderBy: {
          brand: 'asc'
        }
      })

      return brands.map((item: any) => item.brand)
    } catch (error) {
      throw new Error(`Error fetching brands: ${error}`)
    }
  }

  // Tìm kiếm products sử dụng Elasticsearch
  async searchProducts(query: string, page: number = 1, limit: number = 10) {
    try {
      const from = (page - 1) * limit
      
      const result = await esClient.search({
        index: INDEX_NAME,
        from,
        size: limit,
        body: {
          query: {
            multi_match: {
              query,
              fields: ["name", "brand", "category", "color", "description"],
              type: "best_fields",
              fuzziness: "AUTO"
            }
          },
          highlight: {
            fields: {
              name: {},
              brand: {},
              category: {},
              description: {}
            }
          }
        }
      })

      const products = result.body.hits.hits.map((hit: any) => ({
        id: parseInt(hit._id),
        ...hit._source,
        score: hit._score,
        highlight: hit.highlight
      }))

      return {
        products,
        pagination: {
          page,
          limit,
          total: result.body.hits.total.value || result.body.hits.total,
          pages: Math.ceil((result.body.hits.total.value || result.body.hits.total) / limit)
        },
        took: result.body.took,
        maxScore: result.body.hits.max_score
      }
    } catch (error) {
      console.error('Elasticsearch search error:', error)
      // Fallback về PostgreSQL search nếu Elasticsearch lỗi
      return this.searchProductsByName(query, page, limit)
    }
  }

  // Lấy thống kê products
  async getProductStats() {
    try {
      const [totalProducts, totalCategories, totalBrands, avgPrice] = await Promise.all([
        prisma.product.count(),
        prisma.product.findMany({
          select: { category: true },
          distinct: ['category']
        }).then((result: any) => result.length),
        prisma.product.findMany({
          select: { brand: true },
          distinct: ['brand']
        }).then((result: any) => result.length),
        prisma.product.aggregate({
          _avg: {
            price: true
          }
        }).then((result: any) => result._avg.price || 0)
      ])

      return {
        totalProducts,
        totalCategories,
        totalBrands,
        averagePrice: Math.round(avgPrice * 100) / 100
      }
    } catch (error) {
      throw new Error(`Error fetching product stats: ${error}`)
    }
  }

  // Sync toàn bộ data từ PostgreSQL sang Elasticsearch
  async syncAllProductsToElasticsearch() {
    try {
      console.log('🔄 Bắt đầu sync data từ PostgreSQL sang Elasticsearch...')
      
      // Lấy tất cả products từ PostgreSQL
      const products = await prisma.product.findMany({
        orderBy: { id: 'asc' }
      })

      console.log(`📦 Tìm thấy ${products.length} products để sync`)

      // Bulk index vào Elasticsearch
      const body = products.flatMap((product: any) => [
        { index: { _index: INDEX_NAME, _id: product.id.toString() } },
        {
          name: product.name,
          brand: product.brand,
          price: product.price,
          category: product.category,
          color: product.color,
          size: product.size,
          description: product.description,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }
      ])

      const response = await esClient.bulk({ body })
      
      if (response.body.errors) {
        console.error('❌ Một số documents sync thất bại:', response.body.items.filter((item: any) => item.index.error))
      } else {
        console.log('✅ Sync thành công tất cả products')
      }

      return {
        success: true,
        total: products.length,
        synced: response.body.items.length,
        errors: response.body.errors
      }
    } catch (error) {
      console.error('❌ Lỗi khi sync data:', error)
      throw new Error(`Error syncing products to Elasticsearch: ${error}`)
    }
  }
}

export const productService = new ProductService()
