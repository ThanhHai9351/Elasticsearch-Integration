import { prisma } from '../../db/prisma'
import bcrypt from 'bcrypt'

export interface CreateUserData {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
  avatar?: string
}

export interface UpdateUserData {
  email?: string
  username?: string
  password?: string
  firstName?: string
  lastName?: string
  avatar?: string
  isActive?: boolean
}

export class UserService {
  // Tạo user mới
  async createUser(data: CreateUserData) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10)
      
      const user = await prisma.user.create({
        data: {
          ...data,
          password: hashedPassword
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      })
      
      return user
    } catch (error) {
      throw new Error(`Error creating user: ${error}`)
    }
  }

  // Lấy tất cả users
  async getAllUsers(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit
      
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.user.count()
      ])

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      throw new Error(`Error fetching users: ${error}`)
    }
  }

  // Lấy user theo ID
  async getUserById(id: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      return user
    } catch (error) {
      throw new Error(`Error fetching user: ${error}`)
    }
  }

  // Lấy user theo email
  async getUserByEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      })

      return user
    } catch (error) {
      throw new Error(`Error fetching user by email: ${error}`)
    }
  }

  // Lấy user theo username
  async getUserByUsername(username: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      })

      return user
    } catch (error) {
      throw new Error(`Error fetching user by username: ${error}`)
    }
  }

  // Cập nhật user
  async updateUser(id: number, data: UpdateUserData) {
    try {
      // Hash password nếu có
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10)
      }

      const user = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      })

      return user
    } catch (error) {
      throw new Error(`Error updating user: ${error}`)
    }
  }

  // Xóa user (soft delete)
  async deleteUser(id: number) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { isActive: false },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      })

      return user
    } catch (error) {
      throw new Error(`Error deleting user: ${error}`)
    }
  }

  // Xóa user vĩnh viễn
  async hardDeleteUser(id: number) {
    try {
      await prisma.user.delete({
        where: { id }
      })

      return { message: 'User deleted successfully' }
    } catch (error) {
      throw new Error(`Error hard deleting user: ${error}`)
    }
  }

  // Kiểm tra password
  async verifyPassword(plainPassword: string, hashedPassword: string) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword)
    } catch (error) {
      throw new Error(`Error verifying password: ${error}`)
    }
  }
}

export const userService = new UserService()
