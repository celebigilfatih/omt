"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Trophy, 
  Shield, 
  Users, 
  FileText, 
  DollarSign, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  ArrowRight
} from "lucide-react";
import { isAdminAuthenticated } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalTeams: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalPayments: number;
  totalPaymentAmount: number;
  stage1Teams: number;
  stage2Teams: number;
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalTeams: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalPayments: 0,
    totalPaymentAmount: 0,
    stage1Teams: 0,
    stage2Teams: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const checkAuth = async () => {
      const authenticated = isAdminAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Fetch dashboard statistics
        try {
          const [teamsRes, applicationsRes, paymentsRes] = await Promise.all([
            fetch("/api/teams"),
            fetch("/api/admin/applications"),
            fetch("/api/payments")
          ]);

          const teams = teamsRes.ok ? await teamsRes.json() : [];
          const applications = applicationsRes.ok ? await applicationsRes.json() : [];
          const payments = paymentsRes.ok ? await paymentsRes.json() : [];

          setStats({
            totalTeams: teams.length,
            totalApplications: applications.length,
            pendingApplications: applications.filter((app: any) => app.status === "PENDING").length,
            approvedApplications: applications.filter((app: any) => app.status === "APPROVED").length,
            rejectedApplications: applications.filter((app: any) => app.status === "REJECTED").length,
            totalPayments: payments.length,
            totalPaymentAmount: payments.reduce((sum: number, payment: any) => sum + payment.amount, 0),
            stage1Teams: teams.filter((team: any) => team.stage === "STAGE_1").length,
            stage2Teams: teams.filter((team: any) => team.stage === "STAGE_2").length,
          });
        } catch (error) {
          console.error("Error fetching dashboard stats:", error);
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [isMounted]);

  if (!isMounted || isLoading) {
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Shield className="w-12 h-12 text-blue-600 mx-auto" />
          </div>
          <p className="text-lg text-gray-600">Giriş Sayfasına Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Trophy className="h-10 w-10 text-blue-600" />
                Turnuva Yönetim Sistemi
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Hoş geldiniz! Tüm turnuva işlemlerinizi buradan yönetebilirsiniz.</p>
            </div>
            <Button
              onClick={() => router.push("/admin")}
              variant="outline"
              className="gap-2"
            >
              Admin Paneli
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/teams")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Toplam Takım
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalTeams}</div>
              <p className="text-xs text-gray-500 mt-1">Onaylanmış takımlar</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/admin")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Toplam Başvuru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.totalApplications}</div>
              <p className="text-xs text-gray-500 mt-1">Tüm başvurular</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/payments")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Toplam Ödeme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.totalPayments}</div>
              <p className="text-xs text-gray-500 mt-1">Ödeme kaydı</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Toplam Tutar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">₺{stats.totalPaymentAmount.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">Ödeme toplamı</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Applications Status */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Başvuru Durumu
              </CardTitle>
              <CardDescription>Başvuruların mevcut durumu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Bekleyen Başvurular</p>
                      <p className="text-sm text-gray-600">İnceleme aşamasında</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-600 text-white text-lg px-4 py-2">
                    {stats.pendingApplications}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Onaylanan Başvurular</p>
                      <p className="text-sm text-gray-600">Kabul edildi</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                    {stats.approvedApplications}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Reddedilen Başvurular</p>
                      <p className="text-sm text-gray-600">İptal edildi</p>
                    </div>
                  </div>
                  <Badge className="bg-red-600 text-white text-lg px-4 py-2">
                    {stats.rejectedApplications}
                  </Badge>
                </div>
              </div>

              <Button 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push("/admin")}
              >
                Başvuruları Yönet
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Stage Distribution */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Etap Dağılımı
              </CardTitle>
              <CardDescription>Takımların etaplara göre dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-blue-900">1. Etap</h3>
                    <Badge className="bg-blue-600 text-white text-xl px-4 py-2">
                      {stats.stage1Teams}
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700">Birinci etap takımları</p>
                  <div className="mt-3 bg-blue-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${stats.totalTeams > 0 ? (stats.stage1Teams / stats.totalTeams) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-300">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-green-900">2. Etap</h3>
                    <Badge className="bg-green-600 text-white text-xl px-4 py-2">
                      {stats.stage2Teams}
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700">İkinci etap takımları</p>
                  <div className="mt-3 bg-green-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${stats.totalTeams > 0 ? (stats.stage2Teams / stats.totalTeams) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <Button 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push("/teams")}
              >
                Takımları Görüntüle
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Hızlı İşlemler
            </CardTitle>
            <CardDescription>Sık kullanılan işlemlere hızlı erişim</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => router.push("/basvuru")}
              >
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="text-center">
                  <p className="font-semibold">Yeni Başvuru</p>
                  <p className="text-xs text-gray-500">Başvuru formu</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-green-50 hover:border-green-300"
                onClick={() => router.push("/admin")}
              >
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="text-center">
                  <p className="font-semibold">Başvuru Yönetimi</p>
                  <p className="text-xs text-gray-500">Onayla / Reddet</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-purple-50 hover:border-purple-300"
                onClick={() => router.push("/teams")}
              >
                <Users className="h-8 w-8 text-purple-600" />
                <div className="text-center">
                  <p className="font-semibold">Takım Yönetimi</p>
                  <p className="text-xs text-gray-500">Takımları görüntüle</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-orange-50 hover:border-orange-300"
                onClick={() => router.push("/payments")}
              >
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div className="text-center">
                  <p className="font-semibold">Ödeme Yönetimi</p>
                  <p className="text-xs text-gray-500">Ödemeleri takip et</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
