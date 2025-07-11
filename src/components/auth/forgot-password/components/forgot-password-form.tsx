"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getSiteUrl } from "@/lib/utils";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Por favor ingresa tu email" })
    .email({ message: "Dirección de email inválida" }),
});

type FormValues = z.infer<typeof formSchema>;

type ForgotPasswordFormProps = React.HTMLAttributes<HTMLDivElement>;

export function ForgotPasswordForm({
  className,
  ...props
}: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const supabase = createClientComponentClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true);

      // Get the site URL from the environment or current location
      const siteUrl = getSiteUrl();

      // Call Supabase's resetPasswordForEmail method
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${siteUrl}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: "Revisa tu email",
        description:
          "Te hemos enviado un enlace de restablecimiento de contraseña.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        description: "Algo salió mal. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {isSuccess ? (
        <div className="text-center">
          <h3 className="mb-1 text-lg font-medium">Revisa tu email</h3>
          <p className="text-sm text-muted-foreground">
            Hemos enviado un enlace de restablecimiento a tu email. Por favor
            revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nombre@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar enlace de restablecimiento"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
