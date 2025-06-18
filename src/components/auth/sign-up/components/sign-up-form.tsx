"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/providers/auth-provider";
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
import { PasswordInput } from "@/components/utils/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import type { SignUpFormProps, SignUpFormData } from "@/types/auth/sign-up";
import { signUpFormSchema } from "@/types/auth/sign-up";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { saltAndHashPassword } from "@/lib/auth/password-crypto";
import Link from "next/link";

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      acceptWhatsApp: false,
    },
  });

  async function onSubmit(data: SignUpFormData) {
    try {
      setIsLoading(true);

      // Hash the password with email as salt before sending to server
      const hashedPassword = await saltAndHashPassword(
        data.password,
        data.email
      );

      const { success, user, session, confirmEmail, error } = await signUp(
        data.email,
        hashedPassword
      );

      if (!success || error) {
        throw error || new Error("Failed to sign up");
      }

      if (user) {
        // Split fullName into firstName and lastName
        const nameParts = data.fullName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const response = await fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            firstName,
            lastName,
            phone: data.phone,
            acceptWhatsApp: data.acceptWhatsApp,
          }),
        });

        let result: Record<string, unknown>;
        let text = "";

        try {
          text = await response.text();
          result = text ? JSON.parse(text) : {};

          if (!response.ok) {
            throw new Error(
              typeof result.error === "string"
                ? result.error
                : `Server responded with status ${response.status}`
            );
          }
        } catch (parseError) {
          console.error(
            "Response parsing error:",
            parseError,
            "Response text:",
            text
          );
          throw new Error("Invalid server response");
        }

        toast({
          title: "Éxito",
          description:
            "Tu cuenta ha sido creada! Revisa tu email para verificar tu cuenta.",
        });

        // Redirect to verification page instead of dashboard if email confirmation is required
        if (confirmEmail) {
          router.push("/verify-email");
        } else if (session) {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Algo salió mal. Por favor intenta de nuevo.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Nombre Completo
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tu nombre completo"
                    className="h-11"
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
                <FormLabel className="text-sm font-medium text-gray-700">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="tu@email.com"
                    type="email"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Teléfono
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="+591-7-123-4567"
                    type="tel"
                    className="h-11"
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
                <FormLabel className="text-sm font-medium text-gray-700">
                  Contraseña
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Mínimo 6 caracteres"
                    className="h-11"
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
                <FormLabel className="text-sm font-medium text-gray-700">
                  Confirmar Contraseña
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Repite tu contraseña"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <label className="text-sm text-gray-600 cursor-pointer">
                    Acepto los{" "}
                    <Link
                      href="/terms"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      términos y condiciones
                    </Link>
                  </label>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptWhatsApp"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <label className="text-sm text-gray-600 cursor-pointer">
                    Acepto recibir notificaciones por WhatsApp
                  </label>
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "CREANDO CUENTA..." : "CREAR CUENTA"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
