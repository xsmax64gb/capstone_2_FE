"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useRegisterMutation,
  useSendRegisterOtpMutation,
} from "@/lib/api/authApi";
import { useDispatch } from "react-redux";
import { setAuthTokens, setUser } from "@/lib/slices/authSlice";
import { useNotification } from "@/hooks/use-notification";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/lib/i18n/context";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const [sendRegisterOtp, { isLoading: isSendingOtp }] =
    useSendRegisterOtpMutation();
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [pendingRegisterData, setPendingRegisterData] = useState<
    Omit<RegisterFormValues, "confirmPassword">
  >({
    fullName: "",
    email: "",
    password: "",
  });
  const { error: notifyError, success: notifySuccess } = useNotification();
  const { t } = useI18n();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onStartOtpFlow() {
    const isFormValid = await form.trigger();
    if (!isFormValid) {
      return;
    }

    try {
      const formValues = form.getValues();
      await sendRegisterOtp({ email: formValues.email }).unwrap();
      setPendingRegisterData({
        fullName: formValues.fullName,
        email: formValues.email,
        password: formValues.password,
      });
      setIsOtpSent(true);
      setOtpCode("");
      setIsOtpDialogOpen(true);
      notifySuccess(
        t("Đã gửi OTP"),
        t("Vui lòng kiểm tra email để lấy mã OTP"),
      );
    } catch (error: any) {
      const message = error?.data?.message || t("Không thể gửi OTP");
      notifyError(t("Lỗi"), message);
    }
  }

  async function onSubmitRegister() {
    if (otpCode.length !== 6) {
      notifyError(t("Lỗi"), t("OTP gồm 6 chữ số"));
      return;
    }

    try {
      const response = await register({
        fullName: pendingRegisterData.fullName,
        email: pendingRegisterData.email,
        password: pendingRegisterData.password,
        otp: otpCode,
      }).unwrap();

      dispatch(
        setAuthTokens({
          accessToken: response.accessToken,
        }),
      );
      dispatch(setUser(response.user));
      setIsOtpDialogOpen(false);

      notifySuccess(
        t("Đăng ký thành công"),
        t("Chào mừng bạn đến với chúng tôi!"),
      );
      router.push("/dashboard");
    } catch (error: any) {
      const message = error?.data?.message || t("Đăng ký thất bại");
      notifyError(t("Lỗi"), message);
    }
  }

  async function onResendOtp() {
    try {
      await sendRegisterOtp({ email: pendingRegisterData.email }).unwrap();
      notifySuccess(t("Đã gửi lại OTP"), t("Vui lòng kiểm tra email của bạn"));
    } catch (error: any) {
      const message = error?.data?.message || t("Không thể gửi OTP");
      notifyError(t("Lỗi"), message);
    }
  }

  function onBackToEditInfo() {
    setIsOtpDialogOpen(false);
    setOtpCode("");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-center">
          {t("Tạo tài khoản")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("Điền thông tin để tạo tài khoản mới")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Họ tên")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Tên của bạn")}
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
                  <FormLabel>{t("Mật khẩu")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Nhập mật khẩu")}
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
                  <FormLabel>{t("Xác nhận mật khẩu")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Xác nhận mật khẩu")}
                      type="password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              className="w-full"
              disabled={isLoading || isSendingOtp}
              onClick={onStartOtpFlow}
            >
              {isSendingOtp ? (
                <>
                  <Spinner className="mr-2" />
                  {t("Đang gửi OTP...")}
                </>
              ) : (
                t("Tiếp tục xác thực OTP")
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t("Đã có tài khoản?")}{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            {t("Đăng nhập")}
          </Link>
        </div>
      </CardContent>

      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Xác thực OTP")}</DialogTitle>
            <DialogDescription>
              {t("Nhập mã OTP đã gửi đến email")}{" "}
              <strong>{pendingRegisterData.email}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
              disabled={isLoading}
            >
              <InputOTPGroup className="w-full justify-center">
                <InputOTPSlot
                  index={0}
                  className="h-11 w-11 rounded-md border"
                />
                <InputOTPSlot
                  index={1}
                  className="h-11 w-11 rounded-md border"
                />
                <InputOTPSlot
                  index={2}
                  className="h-11 w-11 rounded-md border"
                />
                <InputOTPSlot
                  index={3}
                  className="h-11 w-11 rounded-md border"
                />
                <InputOTPSlot
                  index={4}
                  className="h-11 w-11 rounded-md border"
                />
                <InputOTPSlot
                  index={5}
                  className="h-11 w-11 rounded-md border"
                />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-center text-xs text-slate-500">
              {t("OTP có hiệu lực trong 10 phút")}
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              className="w-full"
              onClick={onSubmitRegister}
              disabled={isLoading || otpCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  {t("Đang đăng ký...")}
                </>
              ) : (
                t("Xác thực OTP và tạo tài khoản")
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onResendOtp}
              disabled={isSendingOtp || isLoading}
            >
              {isSendingOtp ? t("Đang gửi lại OTP...") : t("Gửi lại OTP")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onBackToEditInfo}
              disabled={isLoading}
            >
              {t("Quay lại chỉnh thông tin")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
