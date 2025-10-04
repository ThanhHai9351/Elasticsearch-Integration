import { Request, Response } from 'express'
import { userService, CreateUserData, UpdateUserData } from '../services/user.service'

export class UserController {
  // Tạo user mới
  async createUser(req: Request, res: Response) {
    try {
      const userData: CreateUserData = req.body

      // Validation cơ bản
      if (!userData.email || !userData.username || !userData.password) {
        return res.status(400).json({
          success: false,
          message: 'Email, username và password là bắt buộc'
        })
      }

      // Kiểm tra email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userData.email)) {
        return res.status(400).json({
          success: false,
          message: 'Email không hợp lệ'
        })
      }

      const user = await userService.createUser(userData)

      return res.status(201).json({
        success: true,
        message: 'Tạo user thành công',
        data: user
      })
    } catch (error: any) {
      // Xử lý lỗi duplicate
      if (error.message.includes('Unique constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Email hoặc username đã tồn tại'
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Lấy tất cả users
  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await userService.getAllUsers(page, limit)

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách users thành công',
        data: result.users,
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

  // Lấy user theo ID
  async getUserById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        })
      }

      const user = await userService.getUserById(id)

      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin user thành công',
        data: user
      })
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy user'
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Cập nhật user
  async updateUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const updateData: UpdateUserData = req.body

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        })
      }

      // Validation email nếu có
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(updateData.email)) {
          return res.status(400).json({
            success: false,
            message: 'Email không hợp lệ'
          })
        }
      }

      const user = await userService.updateUser(id, updateData)

      return res.status(200).json({
        success: true,
        message: 'Cập nhật user thành công',
        data: user
      })
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy user'
        })
      }

      if (error.message.includes('Unique constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Email hoặc username đã tồn tại'
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Xóa user (soft delete)
  async deleteUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        })
      }

      const user = await userService.deleteUser(id)

      return res.status(200).json({
        success: true,
        message: 'Xóa user thành công',
        data: user
      })
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy user'
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Xóa user vĩnh viễn
  async hardDeleteUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        })
      }

      const result = await userService.hardDeleteUser(id)

      return res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy user'
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Tìm kiếm user theo email
  async searchUserByEmail(req: Request, res: Response) {
    try {
      const { email } = req.query

      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Email là bắt buộc'
        })
      }

      const user = await userService.getUserByEmail(email)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy user'
        })
      }

      // Loại bỏ password khỏi response
      const { password, ...userWithoutPassword } = user

      return res.status(200).json({
        success: true,
        message: 'Tìm thấy user',
        data: userWithoutPassword
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      })
    }
  }

  // Tìm kiếm user theo username
  async searchUserByUsername(req: Request, res: Response) {
    try {
      const { username } = req.query

      if (!username || typeof username !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Username là bắt buộc'
        })
      }

      const user = await userService.getUserByUsername(username)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy user'
        })
      }

      // Loại bỏ password khỏi response
      const { password, ...userWithoutPassword } = user

      return res.status(200).json({
        success: true,
        message: 'Tìm thấy user',
        data: userWithoutPassword
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

export const userController = new UserController()
