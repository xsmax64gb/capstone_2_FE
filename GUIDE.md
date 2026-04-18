# My App - Setup Guide

## Cấu trúc dự án

```
my-app/
├── app/
│   ├── layout.tsx              # Root layout với providers
│   ├── page.tsx                # Home page
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── dashboard/
│       └── page.tsx
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── protected-route.tsx
│   ├── dashboard/
│   │   └── dashboard-content.tsx
│   ├── notification/
│   │   ├── notification-item.tsx
│   │   └── notification-container.tsx
│   └── ui/                     # shadcn components
├── lib/
│   ├── api/
│   │   ├── baseApi.ts          # RTK Query base configuration
│   │   ├── authApi.ts          # Auth endpoints
│   │   └── examplesApi.ts      # Ví dụ tạo API endpoints
│   ├── slices/
│   │   ├── authSlice.ts        # Auth state management
│   │   └── notificationSlice.ts
│   ├── providers/
│   │   ├── redux-provider.tsx
│   │   └── notification-provider.tsx
│   ├── auth-context.tsx        # Auth context & hook
│   ├── store.ts                # Redux store configuration
│   └── token-manager.ts        # JWT token handling
├── hooks/
│   ├── use-notification.ts     # Global notification hook
│   └── use-fetch.ts            # Helper hook
├── types/
│   └── index.ts                # TypeScript types
├── config/
│   └── api.ts                  # API configuration
└── .env.local                  # Environment variables
```

## Cài đặt & Chạy

1. **Cài đặt dependencies:**
```bash
npm install
# hoặc
pnpm install
# hoặc
yarn install
```

2. **Setup environment variables:**
Tạo file `.env.local` (nếu chưa có):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

3. **Chạy development server:**
```bash
npm run dev
# hoặc
pnpm dev
```

Truy cập: http://localhost:3000

## Authentication (JWT)

### Login Flow:
```typescript
// 1. User gửi email & password
// 2. Backend trả về accessToken, refreshToken & user info
// 3. Token được lưu vào localStorage
// 4. Authorization header sẽ tự động add vào các request
```

### Sử dụng Authentication:

```typescript
import { useAuth } from '@/lib/auth-context'

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) return <p>Chưa đăng nhập</p>

  return <div>Chào {user?.name}</div>
}
```

### Protected Route:

```typescript
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function SecretPage() {
  return (
    <ProtectedRoute>
      <div>Chỉ người dùng đã đăng nhập mới thấy được</div>
    </ProtectedRoute>
  )
}
```

## RTK Query - API Calls

### Tạo API endpoints mới:

```typescript
// lib/api/productsApi.ts
import { baseApi } from './baseApi'

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => '/products',
    }),

    createProduct: builder.mutation<Product, Omit<Product, 'id'>>({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const { useGetProductsQuery, useCreateProductMutation } = productsApi
```

### Sử dụng trong components:

```typescript
'use client'
import { useGetProductsQuery, useCreateProductMutation } from '@/lib/api/productsApi'

export function ProductsList() {
  const { data: products, isLoading } = useGetProductsQuery()
  const [createProduct] = useCreateProductMutation()

  if (isLoading) return <div>Đang tải...</div>

  return (
    <div>
      {products?.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  )
}
```

## Global Notifications

Sử dụng notification system:

```typescript
import { useNotification } from '@/hooks/use-notification'

export function MyComponent() {
  const { success, error, warning, info } = useNotification()

  return (
    <button onClick={() => {
      success('Thành công!', 'Dữ liệu đã được lưu')
      error('Lỗi!', 'Có lỗi xảy ra')
      warning('Cảnh báo!', 'Điều này có thể gây vấn đề')
      info('Thông tin', 'Đây là thông tin mới')
    }}>
      Test Notifications
    </button>
  )
}
```

## Form Validation

Sử dụng `react-hook-form` + `zod`:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6),
})

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  )
}
```

## Environment Variables

### .env.local:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

**NEXT_PUBLIC_** prefix: Biến này sẽ có sẵn ở client-side

## Folder Structure Best Practices

- **components/**: Reusable React components
- **lib/**: Utility functions, API clients, state management
- **hooks/**: Custom React hooks
- **types/**: TypeScript interfaces & types
- **config/**: Configuration files
- **app/**: Next.js pages & layouts

## Development Tips

1. **Redux DevTools**: Cài extension để debug state
2. **RTK Query Devtools**: RTK Query có built-in devtools
3. **Logging**: Sử dụng console.log("[v0] ...") để debug
4. **Type Safety**: Luôn export & sử dụng types từ `@/types`

## Common Issues

### Token hết hạn?
- API sẽ trả về 401, bạn cần tạo refresh token logic
- Hoặc logout & redirect tới login page

### CORS Error?
- Đảm bảo backend có CORS header đúng
- Kiểm tra API_BASE_URL trong .env.local

### State không update?
- Kiểm tra Redux DevTools
- Đảm bảo bạn dispatch action chính xác

## Deployment

```bash
npm run build
npm run start
```

Hoặc deploy lên Vercel:
```bash
vercel deploy
```

## Hỗ trợ & Tài liệu

- [Next.js Documentation](https://nextjs.org)
- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
