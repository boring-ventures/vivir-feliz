import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthLayout from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/sign-up/components/sign-up-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Registrarse - Vivir Feliz",
  description: "Crea tu cuenta en Vivir Feliz",
};

export default function SignUpPage() {
  return (
    <AuthLayout>
      <Card className="bg-white shadow-xl border-0">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Registrarse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignUpForm />
          <div className="text-center">
            <div className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
            <Link
              href="/sign-in"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
            >
                Iniciar Sesión
            </Link>
            </div>
        </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
