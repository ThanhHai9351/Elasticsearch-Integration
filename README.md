# 🛍️ Backend Store - Node.js + Elasticsearch Integration

## 📋 Tổng quan dự án

Dự án **Backend Store** là một hệ thống quản lý sản phẩm được xây dựng với Node.js, Express.js và tích hợp Elasticsearch để cung cấp khả năng tìm kiếm mạnh mẽ và hiệu suất cao. Dự án sử dụng kiến trúc hybrid với PostgreSQL làm nguồn dữ liệu chính và Elasticsearch làm search engine phụ.

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   PostgreSQL    │
│   (React/Vue)   │◄──►│   (Express.js)  │◄──►│   (Source of    │
│                 │    │                 │    │    Truth)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Elasticsearch  │
                       │  (Search Engine)│
                       └─────────────────┘
```

### 🔧 Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL với Prisma ORM
- **Search Engine**: Elasticsearch 7.17.0
- **Authentication**: JWT với bcrypt
- **Real-time**: Socket.io
- **File Upload**: Cloudinary, Multer
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## 🚀 Tính năng chính

### 📦 Quản lý sản phẩm
- ✅ CRUD operations cho sản phẩm
- ✅ Upload ảnh sản phẩm lên Cloudinary
- ✅ Validation dữ liệu với Joi
- ✅ Auto-sync dữ liệu sang Elasticsearch

### 🔍 Tìm kiếm nâng cao
- ✅ **Multi-field search**: Tìm kiếm trên nhiều trường (name, brand, category, color, description)
- ✅ **Fuzzy search**: Tìm kiếm gần đúng với fuzziness AUTO
- ✅ **Highlighting**: Làm nổi bật từ khóa tìm kiếm
- ✅ **Relevance scoring**: Sắp xếp kết quả theo độ liên quan
- ✅ **Pagination**: Phân trang kết quả tìm kiếm
- ✅ **Fallback mechanism**: Tự động chuyển về PostgreSQL nếu Elasticsearch lỗi

### 👥 Quản lý người dùng
- ✅ Đăng ký/Đăng nhập với JWT
- ✅ Bảo mật mật khẩu với bcrypt
- ✅ Upload avatar
- ✅ Quản lý profile

### 🔄 Real-time Features
- ✅ WebSocket với Socket.io
- ✅ Real-time notifications
- ✅ Live updates

## 📁 Cấu trúc thư mục

```
src/
├── api/
│   ├── controllers/          # API Controllers
│   │   ├── product.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/           # Custom Middleware
│   │   └── auth.middleware.ts
│   ├── routes/              # API Routes
│   │   ├── product.routes.ts
│   │   └── user.routes.ts
│   └── services/            # Business Logic
│       ├── product.service.ts
│       └── user.service.ts
├── db/
│   └── prisma.ts           # Prisma Client
├── elasticsearch/
│   └── client.ts           # Elasticsearch Client
├── socket/
│   └── socket.ts           # Socket.io Configuration
└── index.ts               # Application Entry Point
```

## 🛠️ Cài đặt và Chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd elasticsearch
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cài đặt Elasticsearch

#### Sử dụng Docker (Khuyến nghị)
```bash
# Elasticsearch không có security
docker run -d --name elasticsearch -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  elasticsearch:7.17.0

# Hoặc với security (username: elastic, password: elastic)
docker run -d --name elasticsearch -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=true" \
  -e "ELASTIC_PASSWORD=elastic" \
  elasticsearch:7.17.0
```

#### Kiểm tra Elasticsearch
```bash
curl http://localhost:9200
```

### 4. Cấu hình môi trường
Tạo file `.env` trong thư mục gốc:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT
JWT_SECRET="your_jwt_secret_key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Server
PORT=5000
CORS_ORIGIN="http://localhost:3000,http://localhost:4200"

# Elasticsearch
ELASTICSEARCH_URL="http://localhost:9200"
ELASTICSEARCH_USERNAME="elastic"
ELASTICSEARCH_PASSWORD="elastic"
```

### 5. Setup Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Hoặc chạy migration
npm run db:migrate
```

### 6. Chạy ứng dụng
```bash
# Development mode
npm run dev

# Production build
npm run build
```

### 7. Sync dữ liệu ban đầu
```bash
curl -X POST http://localhost:5000/api/products/sync
```

## 📚 API Documentation

### 🔍 Search Endpoints

#### Tìm kiếm với Elasticsearch
```http
GET /api/products/search?q={query}&page={page}&limit={limit}
```

**Parameters:**
- `q` (required): Query tìm kiếm
- `page` (optional): Trang (default: 1)
- `limit` (optional): Số lượng kết quả (default: 10)

**Example:**
```bash
curl "http://localhost:5000/api/products/search?q=iPhone&page=1&limit=10"
```

**Response:**
```json
{
  "success": true,
  "message": "Tìm kiếm products thành công",
  "data": [
    {
      "id": 1,
      "name": "iPhone 15",
      "brand": "Apple",
      "price": 999,
      "category": "Smartphone",
      "color": "Black",
      "size": "6.1 inch",
      "description": "Latest iPhone model",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "score": 1.5,
      "highlight": {
        "name": ["<em>iPhone</em> 15"]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  },
  "meta": {
    "took": 5,
    "maxScore": 1.5
  }
}
```

#### Tìm kiếm với PostgreSQL (Fallback)
```http
GET /api/products/search-by-name?name={name}&page={page}&limit={limit}
```

### 📦 Product Management

#### Tạo sản phẩm mới
```http
POST /api/products
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "brand": "Apple",
  "price": 999,
  "category": "Smartphone",
  "color": "Space Black",
  "size": "6.1 inch",
  "description": "Latest iPhone with titanium design"
}
```

#### Lấy danh sách sản phẩm
```http
GET /api/products?page={page}&limit={limit}&category={category}&brand={brand}
```

#### Cập nhật sản phẩm
```http
PUT /api/products/{id}
Content-Type: application/json

{
  "price": 1099,
  "description": "Updated description"
}
```

#### Xóa sản phẩm
```http
DELETE /api/products/{id}
```

### 🔄 Sync Operations

#### Sync toàn bộ dữ liệu
```http
POST /api/products/sync
```

**Response:**
```json
{
  "success": true,
  "message": "Sync data thành công",
  "data": {
    "success": true,
    "total": 100,
    "synced": 100,
    "errors": false
  }
}
```

### 👥 User Management

#### Đăng ký
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Đăng nhập
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## 🧪 Testing

### Chạy tests
```bash
# Chạy tất cả tests
npm test

# Test Elasticsearch integration
npm run test:elasticsearch
```

### Test Cases
- ✅ Product CRUD operations
- ✅ Elasticsearch search functionality
- ✅ PostgreSQL fallback search
- ✅ Data sync operations
- ✅ User authentication
- ✅ Error handling
- ✅ Performance comparison

## 📊 Monitoring & Debugging

### Health Checks
```bash
# Kiểm tra trạng thái Elasticsearch
curl http://localhost:9200/_cluster/health

# Kiểm tra index stats
curl http://localhost:9200/products/_stats

# Xem mapping
curl http://localhost:9200/products/_mapping
```

### Application Logs
Ứng dụng sẽ log các thông tin sau:
- ✅ Elasticsearch connection status
- 🔄 Data sync operations
- ❌ Error handling và fallback
- 📊 Performance metrics

## 🔧 Scripts có sẵn

```bash
# Development
npm run dev              # Chạy development server
npm run build           # Build production

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run migrations
npm run db:studio       # Open Prisma Studio

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run format          # Format code với Prettier
npm run prettier        # Check code formatting

# Testing
npm test                # Run Jest tests
npm run test:elasticsearch  # Test Elasticsearch integration
```

## 🚀 Performance Benefits

### Elasticsearch vs PostgreSQL Search
- ⚡ **Tốc độ**: Elasticsearch nhanh hơn 3-5 lần với large datasets
- 🔍 **Full-text search**: Tìm kiếm toàn văn với relevance scoring
- 🎯 **Multi-field**: Tìm kiếm nhiều trường trong một query
- 📈 **Scalability**: Distributed architecture cho high availability

### Fallback Strategy
- 🛡️ **Reliability**: PostgreSQL backup khi Elasticsearch down
- 🔄 **Seamless**: Automatic fallback không ảnh hưởng user experience
- 📝 **Logging**: Detailed logs cho monitoring và debugging

## 🔮 Future Enhancements

### Planned Features
1. **Real-time sync** với PostgreSQL change streams
2. **Advanced analytics** với Elasticsearch aggregations
3. **Auto-complete** với suggest queries
4. **Faceted search** với filters và facets
5. **Geospatial search** nếu cần
6. **Machine learning** relevance tuning

### Scalability Considerations
1. **Cluster setup** cho production environment
2. **Index sharding** strategy
3. **Replica configuration** cho high availability
4. **Monitoring** với ELK stack
5. **Backup** và recovery strategy

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

ISC License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👨‍💻 Author

**ThanhHai** - [GitHub](https://github.com/thanhhai)

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi:
- Tạo issue trên GitHub
- Kiểm tra documentation trong thư mục `src/api/routes/`
- Xem demo và examples trong `ELASTICSEARCH_DEMO.md`

---

⭐ **Star repository này nếu bạn thấy hữu ích!**
