"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  Eye,
  Phone,
  Mail,
  Calendar,
  Trophy,
  LogOut,
  UserPlus,
  Key,
  Trash2,
  Edit,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { isAdminAuthenticated, clearAdminSession } from "@/lib/auth";

// Types
interface TeamApplication {
  id: string;
  teamName: string;
  coachName: string;
  phoneNumber: string;
  email: string;
  stage: string;
  ageGroups: string[];
  description?: string;
  logoUrl?: string;
  status: string;
  createdAt: string;
}



interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const STAGES = [
  { value: "STAGE_1", label: "1. Etap" },
  { value: "STAGE_2", label: "2. Etap" },
  { value: "STAGE_3", label: "3. Etap" },
  { value: "STAGE_4", label: "4. Etap" },
  { value: "FINAL", label: "Final" },
];

const AGE_GROUPS = [
  { value: "Y2012", label: "2012" },
  { value: "Y2013", label: "2013" },
  { value: "Y2014", label: "2014" },
  { value: "Y2015", label: "2015" },
  { value: "Y2016", label: "2016" },
  { value: "Y2017", label: "2017" },
  { value: "Y2018", label: "2018" },
  { value: "Y2019", label: "2019" },
  { value: "Y2020", label: "2020" },
  { value: "Y2021", label: "2021" },
  { value: "Y2022", label: "2022" },
];

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Beklemede", color: "bg-yellow-100 text-yellow-800" },
  { value: "APPROVED", label: "Onaylandı", color: "bg-green-100 text-green-800" },
  { value: "REJECTED", label: "Reddedildi", color: "bg-red-100 text-red-800" },
];

export default function AdminPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<TeamApplication[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"applications" | "users">("applications");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<TeamApplication | null>(null);
  
  // User management states
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newUser, setNewUser] = useState({ email: "", name: "", password: "" });
  const [newPassword, setNewPassword] = useState({ password: "", confirmPassword: "" });
  const [userActionLoading, setUserActionLoading] = useState(false);



  // Check authentication on component mount
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/admin/login");
      return;
    }
  }, [router]);

  // Logout function
  const handleLogout = () => {
    clearAdminSession();
    router.push("/admin/login");
  };

  // Fetch data
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      return; // Don't fetch data if not authenticated
    }

    const fetchData = async () => {
      try {
        const [applicationsRes, usersRes] = await Promise.all([
          fetch("/api/admin/applications"),
          fetch("/api/admin/users")
        ]);

        if (applicationsRes.ok) {
          const applicationsData = await applicationsRes.json();
          setApplications(applicationsData);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle application approval/rejection
  const handleApplicationAction = async (applicationId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Refresh data
        const applicationsRes = await fetch("/api/admin/applications");
        
        if (applicationsRes.ok) {
          const applicationsData = await applicationsRes.json();
          setApplications(applicationsData);
        }
      }
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  // User management functions
  const handleAddUser = async () => {
    if (!newUser.email || !newUser.name || !newUser.password) {
      alert("Lütfen tüm alanları doldurun");
      return;
    }

    console.log('Sending user data:', newUser);
    setUserActionLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const usersRes = await fetch("/api/admin/users");
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
        setNewUser({ email: "", name: "", password: "" });
        setShowAddUserDialog(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Kullanıcı eklenirken hata oluştu");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Kullanıcı eklenirken hata oluştu");
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.password || !selectedUser) {
      alert("Lütfen yeni şifreyi girin");
      return;
    }

    if (newPassword.password !== newPassword.confirmPassword) {
      alert("Şifreler eşleşmiyor");
      return;
    }

    setUserActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "change_password", password: newPassword.password }),
      });

      if (response.ok) {
        setNewPassword({ password: "", confirmPassword: "" });
        setShowChangePasswordDialog(false);
        setSelectedUser(null);
        alert("Şifre başarıyla değiştirildi");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Şifre değiştirilirken hata oluştu");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Şifre değiştirilirken hata oluştu");
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const usersRes = await fetch("/api/admin/users");
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Kullanıcı silinirken hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Kullanıcı silinirken hata oluştu");
    }
  };

  // Filter applications - only show pending and rejected
  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.coachName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Only show pending and rejected applications
    const isPendingOrRejected = app.status === "PENDING" || app.status === "REJECTED";
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus && isPendingOrRejected;
  });




  // Filter users
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return statusOption ? (
      <Badge className={statusOption.color}>
        {statusOption.label}
      </Badge>
    ) : (
      <Badge variant="secondary">{status}</Badge>
    );
  };

  const getStageLabel = (stage: string) => {
    const stageObj = STAGES.find((s) => s.value === stage);
    return stageObj ? stageObj.label : stage;
  };

  const getAgeGroupLabel = (ageGroup: string) => {
    const ageObj = AGE_GROUPS.find((a) => a.value === ageGroup);
    return ageObj ? ageObj.label : ageGroup.replace("Y", "");
  };

  const renderAgeGroupsWithCounts = (ageGroups: string[], ageGroupTeamCounts?: Record<string, number>) => {
    return ageGroups.map((ageGroup) => {
      const label = getAgeGroupLabel(ageGroup);
      const count = ageGroupTeamCounts?.[ageGroup];
      return (
        <Badge key={ageGroup} variant="outline" className="text-xs">
          {label}{count ? ` (${count} takım)` : ''}
        </Badge>
      );
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Trophy className="mr-3 h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yönetici Paneli</h1>
              <p className="text-gray-600">Başvuru onaylama ve kullanıcı yönetimi</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(app => app.status === "PENDING").length}
                  </p>
                  <p className="text-sm text-gray-600">Bekleyen Başvuru</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(app => app.status === "APPROVED").length}
                  </p>
                  <p className="text-sm text-gray-600">Onaylanan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(app => app.status === "REJECTED").length}
                  </p>
                  <p className="text-sm text-gray-600">Reddedilen</p>
                </div>
              </div>
            </CardContent>
          </Card>



          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <UserPlus className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  <p className="text-sm text-gray-600">Admin Kullanıcı</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "applications"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="inline mr-2 h-4 w-4" />
            Başvurular ({applications.length})
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "users"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <UserPlus className="inline mr-2 h-4 w-4" />
            Kullanıcılar ({users.length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4 md:space-y-0 md:flex md:gap-4 md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ara
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={
                activeTab === "applications" 
                  ? "Takım adı veya hoca adı ile ara..."
                  : "Kullanıcı adı veya email ile ara..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {activeTab === "applications" && (
          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                {STATUS_OPTIONS.filter(status => status.value === "PENDING" || status.value === "REJECTED").map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}


      </div>

      {/* Content */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {applications.length === 0 ? "Henüz başvuru bulunmuyor" : "Arama kriterlerinize uygun başvuru bulunamadı"}
              </h3>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {application.teamName}
                        </h3>
                        {getStatusBadge(application.status)}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Hoca:</p>
                          <p className="font-medium">{application.coachName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Etap:</p>
                          <p className="font-medium">{getStageLabel(application.stage)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Telefon:</p>
                          <p className="font-medium">{application.phoneNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">E-posta:</p>
                          <p className="font-medium">{application.email}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Yaş Grupları:</p>
                        <div className="flex flex-wrap gap-1">
                          {application.ageGroups.map((ageGroup) => (
                            <Badge key={ageGroup} variant="outline" className="text-xs">
                              {getAgeGroupLabel(ageGroup)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="mr-1 h-3 w-3" />
                        Başvuru: {new Date(application.createdAt).toLocaleDateString("tr-TR")}
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Detay
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{application.teamName} - Başvuru Detayı</DialogTitle>
                            <DialogDescription>
                              Takım başvuru bilgileri ve detayları
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700">Takım Adı</label>
                                <p className="mt-1">{application.teamName}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Hoca Adı</label>
                                <p className="mt-1">{application.coachName}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Telefon</label>
                                <p className="mt-1">{application.phoneNumber}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">E-posta</label>
                                <p className="mt-1">{application.email}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Etap</label>
                                <p className="mt-1">{getStageLabel(application.stage)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Durum</label>
                                <div className="mt-1">{getStatusBadge(application.status)}</div>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-gray-700">Yaş Grupları</label>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {application.ageGroups.map((ageGroup) => (
                                  <Badge key={ageGroup} variant="outline">
                                    {getAgeGroupLabel(ageGroup)}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {application.description && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Açıklama</label>
                                <p className="mt-1 text-gray-600">{application.description}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {application.status === "PENDING" && (
                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Onayla
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Başvuruyu Onayla</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {application.teamName} takımının başvurusunu onaylamak istediğinizden emin misiniz?
                                  Bu işlem geri alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleApplicationAction(application.id, "approve")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Onayla
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <XCircle className="mr-2 h-4 w-4" />
                                Reddet
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Başvuruyu Reddet</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {application.teamName} takımının başvurusunu reddetmek istediğinizden emin misiniz?
                                  Bu işlem geri alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleApplicationAction(application.id, "reject")}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Reddet
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Admin Kullanıcıları</h2>
            <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Kullanıcı Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Admin Kullanıcısı Ekle</DialogTitle>
                  <DialogDescription>
                    Yeni bir admin kullanıcısı oluşturun.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Ad Soyad</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Şifre</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Güçlü bir şifre girin"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddUserDialog(false);
                        setNewUser({ name: "", email: "", password: "" });
                      }}
                    >
                      İptal
                    </Button>
                    <Button
                      onClick={handleAddUser}
                      disabled={userActionLoading || !newUser.name || !newUser.email || !newUser.password}
                    >
                      {userActionLoading ? "Ekleniyor..." : "Kullanıcı Ekle"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {users.length === 0 ? "Henüz kullanıcı bulunmuyor" : "Arama kriterlerinize uygun kullanıcı bulunamadı"}
                </h3>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Mail className="mr-1 h-3 w-3" />
                          {user.email}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-xs text-gray-500 pt-2 border-t">
                        <Calendar className="mr-1 h-3 w-3" />
                        Oluşturulma: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Dialog open={showChangePasswordDialog && selectedUser?.id === user.id} onOpenChange={(open) => {
                          setShowChangePasswordDialog(open);
                          if (!open) {
                            setSelectedUser(null);
                            setNewPassword({ password: "", confirmPassword: "" });
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Key className="h-3 w-3" />
                              Şifre Değiştir
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Şifre Değiştir</DialogTitle>
                              <DialogDescription>
                                {user.name} kullanıcısının şifresini değiştirin.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="newPassword">Yeni Şifre</Label>
                                <Input
                                  id="newPassword"
                                  type="password"
                                  value={newPassword.password}
                                  onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                                  placeholder="Yeni şifre"
                                />
                              </div>
                              <div>
                                <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                                <Input
                                  id="confirmPassword"
                                  type="password"
                                  value={newPassword.confirmPassword}
                                  onChange={(e) => setNewPassword({ ...newPassword, confirmPassword: e.target.value })}
                                  placeholder="Şifre tekrar"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowChangePasswordDialog(false);
                                    setSelectedUser(null);
                                    setNewPassword({ password: "", confirmPassword: "" });
                                  }}
                                >
                                  İptal
                                </Button>
                                <Button
                                  onClick={handleChangePassword}
                                  disabled={userActionLoading || !newPassword.password || newPassword.password !== newPassword.confirmPassword}
                                >
                                  {userActionLoading ? "Değiştiriliyor..." : "Şifre Değiştir"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                              Sil
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                {user.name} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}


    </div>
  );
}