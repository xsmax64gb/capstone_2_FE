'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRegisterMutation } from '@/lib/api/authApi'
import { useDispatch } from 'react-redux'
import { setAuthTokens, setUser } from '@/lib/slices/authSlice'
import { useNotification } from '@/hooks/use-notification'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/lib/i18n/context'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [register, { isLoading }] = useRegisterMutation()
  const { error: notifyError, success: notifySuccess } = useNotification()
  const { t } = useI18n()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    try {
      const { confirmPassword, ...registerData } = values
      const response = await register(registerData).unwrap()
      
      dispatch(setAuthTokens({
        accessToken: response.accessToken,
      }))
      dispatch(setUser(response.user))
      
      notifySuccess(t('Đăng ký thành công'), t('Chào mừng bạn đến với chúng tôi!'))
      router.push('/dashboard')
    } catch (error: any) {
      const message = error?.data?.message || t('Đăng ký thất bại')
      notifyError(t('Lỗi'), message)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-center">{t('Tạo tài khoản')}</CardTitle>
        <CardDescription className="text-center">
          {t('Điền thông tin để tạo tài khoản mới')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Họ tên')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('Tên của bạn')}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@example.com"
                      type="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Mật khẩu')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('Nhập mật khẩu')}
                      type="password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Xác nhận mật khẩu')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('Xác nhận mật khẩu')}
                      type="password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  {t('Đang đăng ký...')}
                </>
              ) : (
                t('Tạo tài khoản')
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t('Đã có tài khoản?')}{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            {t('Đăng nhập')}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
