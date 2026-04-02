"use client";

import { useEffect } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  useChangePasswordMutation,
  useSendChangePasswordOtpMutation,
} from "@/store/services/authApi";
import { useNotification } from "@/hooks/use-notification";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";

const schema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmNewPassword: z.string(),
    otp: z.string().length(6, "OTP gồm 6 chữ số"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function ChangePasswordOtpForm() {
  const { user } = useAuth();
  const { success: notifySuccess, error: notifyError } = useNotification();
  const [sendOtp, { isLoading: isSendingOtp }] =
    useSendChangePasswordOtpMutation();
  const [changePassword, { isLoading: isChanging }] =
    useChangePasswordMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user?.email || "",
      newPassword: "",
      confirmNewPassword: "",
      otp: "",
    },
  });

  const isLoading = isSendingOtp || isChanging;

  useEffect(() => {
    if (user?.email) {
      form.setValue("email", user.email);
    }
  }, [form, user?.email]);

  const onSendOtp = async () => {
    const isEmailValid = await form.trigger("email");
    if (!isEmailValid) {
      return;
    }

    try {
      const email = form.getValues("email");
      await sendOtp({ email }).unwrap();
      notifySuccess(
        "Đã gửi OTP",
        "Vui lòng kiểm tra email để lấy mã OTP đổi mật khẩu",
      );
    } catch (error: any) {
      const message = error?.data?.message || "Gửi OTP thất bại";
      notifyError("Lỗi", message);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await changePassword({
        email: values.email,
        newPassword: values.newPassword,
        otp: values.otp,
      }).unwrap();

      form.reset({
        email: values.email,
        newPassword: "",
        confirmNewPassword: "",
        otp: "",
      });
      notifySuccess("Đổi mật khẩu thành công", "Mật khẩu mới đã được cập nhật");
    } catch (error: any) {
      const message = error?.data?.message || "Đổi mật khẩu thất bại";
      notifyError("Lỗi", message);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-lg font-bold">Bảo mật tài khoản</h3>
      <p className="mb-5 text-sm text-slate-500">
        Xác thực OTP trước khi đổi mật khẩu để bảo vệ tài khoản.
      </p>
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
                    type="email"
                    placeholder="email@example.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
              <ShieldCheck className="h-4 w-4" />
              Xác thực OTP email
            </div>

            <Button
              type="button"
              variant="outline"
              className="mb-4 w-full border-slate-300 bg-white hover:bg-slate-100"
              onClick={onSendOtp}
              disabled={isLoading}
            >
              {isSendingOtp ? (
                <>
                  <Spinner className="mr-2" />
                  Đang gửi OTP...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Gửi OTP đổi mật khẩu
                </>
              )}
            </Button>

            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã OTP</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
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
                  </FormControl>
                  <p className="mt-2 text-xs text-slate-500">
                    Mã OTP có hiệu lực trong 10 phút.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu mới"
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
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isChanging ? (
              <>
                <Spinner className="mr-2" />
                Đang đổi mật khẩu...
              </>
            ) : (
              "Xác nhận đổi mật khẩu"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
