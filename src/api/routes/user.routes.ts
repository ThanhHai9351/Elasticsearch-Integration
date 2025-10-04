import { Router } from 'express'
import { userController } from '../controllers/user.controller'

const router = Router()

// POST /api/users - Tạo user mới
router.post('/', userController.createUser)

// GET /api/users - Lấy danh sách users (có phân trang)
router.get('/', userController.getAllUsers)

// GET /api/users/search/email - Tìm kiếm user theo email
router.get('/search/email', userController.searchUserByEmail)

// GET /api/users/search/username - Tìm kiếm user theo username
router.get('/search/username', userController.searchUserByUsername)

// GET /api/users/:id - Lấy user theo ID
router.get('/:id', userController.getUserById)

// PUT /api/users/:id - Cập nhật user
router.put('/:id', userController.updateUser)

// DELETE /api/users/:id - Xóa user (soft delete)
router.delete('/:id', userController.deleteUser)

// DELETE /api/users/:id/hard - Xóa user vĩnh viễn
router.delete('/:id/hard', userController.hardDeleteUser)

export default router
