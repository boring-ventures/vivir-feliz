import { Heart } from "lucide-react";
import Link from "next/link";

interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <Heart className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-gray-900">Vivir Feliz</h1>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
