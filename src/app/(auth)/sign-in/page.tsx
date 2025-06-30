import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthLayout from "@/components/auth/auth-layout";
import { UserAuthForm } from "@/components/auth/sign-in/components/user-auth-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Iniciar Sesión - Vivir Feliz",
  description: "Inicia sesión en tu cuenta de Vivir Feliz",
};

export default function SignInPage() {
  return (
    <AuthLayout>
      <Card className="bg-white shadow-xl border-0">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Iniciar Sesión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UserAuthForm />
          <div className="text-center space-y-2">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
