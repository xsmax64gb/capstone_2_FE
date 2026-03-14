# My App - Next.js Frontend with RTK Query

Một ứng dụng Frontend hoàn chỉnh với authentication, RTK Query, và global notifications.

## Features

✅ **JWT Authentication** - Login/Register với token-based auth  
✅ **RTK Query** - Quản lý API calls với caching tự động  
✅ **Global Notifications** - Toast system đẹp theo shadcn style  
✅ **Protected Routes** - Tự động redirect user chưa đăng nhập  
✅ **TypeScript** - Full type safety  
✅ **shadcn/ui** - Beautiful UI components  
✅ **React Hook Form** - Form validation với Zod  

## Quick Start

### 1. Cài đặt
```bash
npm install
# hoặc
pnpm install
```

### 2. Cấu hình
Tạo file `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 3. Chạy development
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## Cấu trúc thư mục

```
├── app/                          # Next.js pages
│   ├── login/                    # Trang đăng nhập
│   ├── register/                 # Trang đăng ký
│   ├── dashboard/                # Dashboard (protected)
│   └── layout.tsx                # Root layout với providers
├── components/
│   ├── auth/                     # Auth components
│   ├── dashboard/                # Dashboard components
│   ├── notification/             # Notification system
│   └── ui/                       # shadcn components
├── lib/
│   ├── api/                      # RTK Query endpoints
│   ├── slices/                   # Redux slices
│   ├── providers/                # React providers
│   ├── store.ts                  # Redux store
│   ├── auth-context.tsx          # Auth context
│   └── token-manager.ts          # JWT token management
├── hooks/                        # Custom hooks
├── types/                        # TypeScript types
└── config/                       # Configuration files
```

## Sử dụng

### Authentication
```typescript
import { useAuth } from '@/lib/auth-context'

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()
  return <div>{user?.name}</div>
}
```

### API Calls
```typescript
import { useGetUsersQuery } from '@/lib/api/usersApi'

export function UsersList() {
  const { data: users } = useGetUsersQuery()
  return <div>{users?.map(u => <div key={u.id}>{u.name}</div>)}</div>
}
```

### Notifications
```typescript
import { useNotification } from '@/hooks/use-notification'

export function MyComponent() {
  const { success, error } = useNotification()
  
  return (
    <button onClick={() => success('Thành công!')}>
      Show Notification
    </button>
  )
}
```

## Backend API Requirements

Ứng dụng này kỳ vọng các endpoints sau từ backend (http://localhost:3001):

### Auth Endpoints
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `GET /auth/me` - Lấy info user hiện tại
- `POST /auth/logout` - Đăng xuất
- `POST /auth/refresh` - Refresh token

### Response Format
```typescript
// Login & Register response
{
  accessToken: string
  refreshToken?: string
  user: {
    id: string
    email: string
    name: string
  }
}
```

## Tài liệu thêm

Xem file [GUIDE.md](./GUIDE.md) để hướng dẫn chi tiết.

## Tech Stack

- **Framework**: Next.js 16+
- **UI**: shadcn/ui + Tailwind CSS
- **State Management**: Redux Toolkit + RTK Query
- **Forms**: React Hook Form + Zod
- **Language**: TypeScript
- **Auth**: JWT Token-based

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm run start

# Lint
npm run lint
```

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## License

MIT
