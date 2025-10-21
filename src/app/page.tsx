"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Shield } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = isAdminAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);

      // Redirect based on authentication status
      if (authenticated) {
        router.push("/basvuru");
      } else {
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Trophy className="w-12 h-12 text-blue-600 mx-auto" />
          </div>
          <p className="text-lg text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin mb-4">
          {isAuthenticated ? (
            <Trophy className="w-12 h-12 text-blue-600 mx-auto" />
          ) : (
            <Shield className="w-12 h-12 text-blue-600 mx-auto" />
          )}
        </div>
        <p className="text-lg text-gray-600">
          {isAuthenticated ? "Başvuru Formuna Yönlendiriliyor..." : "Giriş Sayfasına Yönlendiriliyor..."}
        </p>
      </div>
    </div>
  );
}
