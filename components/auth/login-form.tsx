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
import { useLoginMutation } from '@/lib/api/authApi'
import { useDispatch } from 'react-redux'
import { setAuthTokens, setUser } from '@/lib/slices/authSlice'
import { useNotification } from '@/hooks/use-notification'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/lib/i18n/context'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [login, { isLoading }] = useLoginMutation()
  const { error: notifyError, success: notifySuccess } = useNotification()
  const { t } = useI18n()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      const response = await login(values).unwrap()
      
      dispatch(setAuthTokens({
        accessToken: response.accessToken,
      }))
      dispatch(setUser(response.user))
      
      notifySuccess(t('Đăng nhập thành công'), t('Chào mừng bạn!'))
      const onboardingPending = response.user.onboardingDone === false
      router.push(onboardingPending ? '/onboarding' : '/dashboard')
    } catch (error: any) {
      const message = error?.data?.message || t('Đăng nhập thất bại')
      notifyError(t('Lỗi'), message)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-center">{t('Đăng nhập')}</CardTitle>
        <CardDescription className="text-center">
          {t('Nhập email và mật khẩu của bạn để đăng nhập')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  {t('Đang đăng nhập...')}
                </>
              ) : (
                t('Đăng nhập')
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t('Chưa có tài khoản?')}{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            {t('Đăng ký ngay')}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
