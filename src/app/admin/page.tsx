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

interface Team {
  id: string;
  teamName: string;
  coachName: string;
  phoneNumber: string;
  stage: string;
  ageGroups: string[];
  ageGroupTeamCounts?: Record<string, number>;
  description?: string;
  logoUrl?: string;
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
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"applications" | "teams" | "users">("applications");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<TeamApplication | null>(null);
  
  // Teams filtering states
  const [teamSearchTerm, setTeamSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  
  // Teams pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Team>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // User management states
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newUser, setNewUser] = useState({ email: "", name: "", password: "" });
  const [newPassword, setNewPassword] = useState({ password: "", confirmPassword: "" });
  const [userActionLoading, setUserActionLoading] = useState(false);

  // Team management states
  const [showEditTeamDialog, setShowEditTeamDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editTeamData, setEditTeamData] = useState({
    teamName: "",
    coachName: "",
    phoneNumber: "",
    stage: "",
    ageGroups: [] as string[],
    ageGroupTeamCounts: {} as Record<string, number>,
    description: "",
    logoUrl: ""
  });
  const [teamActionLoading, setTeamActionLoading] = useState(false);

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
        const [applicationsRes, teamsRes, usersRes] = await Promise.all([
          fetch("/api/admin/applications"),
          fetch("/api/teams"),
          fetch("/api/admin/users")
        ]);

        if (applicationsRes.ok) {
          const applicationsData = await applicationsRes.json();
          setApplications(applicationsData);
        }

        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setTeams(teamsData);
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
        const teamsRes = await fetch("/api/teams");
        
        if (applicationsRes.ok) {
          const applicationsData = await applicationsRes.json();
          setApplications(applicationsData);
        }
        
        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setTeams(teamsData);
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

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.coachName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter teams
  const filteredAndSortedTeams = teams
    .filter((team) => {
      const matchesSearch = 
        team.teamName.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
        team.coachName.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
        team.phoneNumber.includes(teamSearchTerm);
      
      const matchesStage = stageFilter === "all" || team.stage === stageFilter;
      
      return matchesSearch && matchesStage;
    })
    .sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination calculations
  const totalTeams = filteredAndSortedTeams.length;
  const totalPages = Math.ceil(totalTeams / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeams = filteredAndSortedTeams.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [teamSearchTerm, stageFilter]);

  // Handle sorting
  const handleSort = (field: keyof Team) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Get sort icon
  const getSortIcon = (field: keyof Team) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  // Handle edit team
  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setEditTeamData({
      teamName: team.teamName,
      coachName: team.coachName,
      phoneNumber: team.phoneNumber,
      stage: team.stage,
      ageGroups: team.ageGroups,
      ageGroupTeamCounts: team.ageGroupTeamCounts || {},
      description: team.description || "",
      logoUrl: team.logoUrl || ""
    });
    setShowEditTeamDialog(true);
  };

  // Handle update team
  const handleUpdateTeam = async () => {
    if (!selectedTeam) return;

    setTeamActionLoading(true);
    try {
      const response = await fetch(`/api/admin/teams/${selectedTeam.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editTeamData),
      });

      if (response.ok) {
        // Refresh teams data
        const teamsResponse = await fetch("/api/admin/teams");
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeams(teamsData);
        }
        setShowEditTeamDialog(false);
        setSelectedTeam(null);
      } else {
        console.error("Takım güncellenirken hata oluştu");
      }
    } catch (error) {
      console.error("Takım güncellenirken hata oluştu:", error);
    } finally {
      setTeamActionLoading(false);
    }
  };

  // Handle delete team
  const handleDeleteTeam = async (teamId: string) => {
    setTeamActionLoading(true);
    try {
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh teams data
        const teamsResponse = await fetch("/api/admin/teams");
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeams(teamsData);
        }
      } else {
        console.error("Takım silinirken hata oluştu");
      }
    } catch (error) {
      console.error("Takım silinirken hata oluştu:", error);
    } finally {
      setTeamActionLoading(false);
    }
  };

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
              <p className="text-gray-600">Başvuru onaylama ve takım yönetimi</p>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
                  <p className="text-sm text-gray-600">Aktif Takım</p>
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
            onClick={() => setActiveTab("teams")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "teams"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users className="inline mr-2 h-4 w-4" />
            Takımlar ({teams.length})
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
                  : activeTab === "teams"
                  ? "Takım adı, hoca adı veya telefon ile ara..."
                  : "Kullanıcı adı veya email ile ara..."
              }
              value={activeTab === "teams" ? teamSearchTerm : searchTerm}
              onChange={(e) => {
                if (activeTab === "teams") {
                  setTeamSearchTerm(e.target.value);
                } else {
                  setSearchTerm(e.target.value);
                }
              }}
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
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {activeTab === "teams" && (
          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etap
            </label>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Etap seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Etaplar</SelectItem>
                {STAGES.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === "applications" ? (
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
      ) : (
        <div className="space-y-4">
          {paginatedTeams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {teams.length === 0 ? "Henüz onaylanmış takım bulunmuyor" : "Arama kriterlerinize uygun takım bulunamadı"}
              </h3>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Logo</TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort("teamName")}
                          >
                            <div className="flex items-center gap-1">
                              Takım Adı
                              {getSortIcon("teamName")}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort("coachName")}
                          >
                            <div className="flex items-center gap-1">
                              Hoca
                              {getSortIcon("coachName")}
                            </div>
                          </TableHead>
                          <TableHead>Telefon</TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort("stage")}
                          >
                            <div className="flex items-center gap-1">
                              Etap
                              {getSortIcon("stage")}
                            </div>
                          </TableHead>
                          <TableHead>Yaş Grupları (Takım Sayıları)</TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort("createdAt")}
                          >
                            <div className="flex items-center gap-1">
                              Katılım Tarihi
                              {getSortIcon("createdAt")}
                            </div>
                          </TableHead>
                          <TableHead className="w-20">İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTeams.map((team) => (
                          <TableRow key={team.id} className="hover:bg-gray-50">
                            <TableCell>
                              {team.logoUrl ? (
                                <img
                                  src={team.logoUrl}
                                  alt={`${team.teamName} logosu`}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <Trophy className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-gray-900">{team.teamName}</div>
                              {team.description && (
                                <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                                  {team.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Phone className="mr-1 h-3 w-3 text-gray-400" />
                                {team.coachName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Phone className="mr-1 h-3 w-3 text-gray-400" />
                                {team.phoneNumber}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {getStageLabel(team.stage)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {renderAgeGroupsWithCounts(team.ageGroups.slice(0, 3), team.ageGroupTeamCounts)}
                                {team.ageGroups.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{team.ageGroups.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="mr-1 h-3 w-3" />
                                {new Date(team.createdAt).toLocaleDateString("tr-TR")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" title="Görüntüle">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      {team.logoUrl && (
                                        <img
                                          src={team.logoUrl}
                                          alt={`${team.teamName} logosu`}
                                          className="w-8 h-8 rounded object-cover"
                                        />
                                      )}
                                      {team.teamName}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Takım detayları ve bilgileri
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-4 py-4">
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Hoca</Label>
                                      <p className="mt-1">{team.coachName}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Telefon</Label>
                                      <p className="mt-1">{team.phoneNumber}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Etap</Label>
                                      <p className="mt-1">{getStageLabel(team.stage)}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Katılım Tarihi</Label>
                                      <p className="mt-1">{new Date(team.createdAt).toLocaleDateString("tr-TR")}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <Label className="text-sm font-medium text-gray-700">Yaş Grupları (Takım Sayıları)</Label>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {renderAgeGroupsWithCounts(team.ageGroups, team.ageGroupTeamCounts)}
                                      </div>
                                    </div>
                                    {team.description && (
                                      <div className="col-span-2">
                                        <Label className="text-sm font-medium text-gray-700">Açıklama</Label>
                                        <p className="mt-1 text-sm text-gray-600">{team.description}</p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                title="Düzenle"
                                onClick={() => handleEditTeam(team)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    title="Sil"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Takımı Sil</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      "{team.teamName}" takımını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteTeam(team.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {paginatedTeams.map((team) => (
                  <Card key={team.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {team.logoUrl ? (
                            <img
                              src={team.logoUrl}
                              alt={`${team.teamName} logosu`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Trophy className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">{team.teamName}</h3>
                            <p className="text-sm text-gray-600">{team.coachName}</p>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg mx-4">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {team.logoUrl && (
                                  <img
                                    src={team.logoUrl}
                                    alt={`${team.teamName} logosu`}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                )}
                                {team.teamName}
                              </DialogTitle>
                              <DialogDescription>
                                Takım detayları ve bilgileri
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Hoca</Label>
                                <p className="mt-1">{team.coachName}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Telefon</Label>
                                <p className="mt-1">{team.phoneNumber}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Etap</Label>
                                <p className="mt-1">{getStageLabel(team.stage)}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Katılım Tarihi</Label>
                                <p className="mt-1">{new Date(team.createdAt).toLocaleDateString("tr-TR")}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Yaş Grupları (Takım Sayıları)</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {renderAgeGroupsWithCounts(team.ageGroups, team.ageGroupTeamCounts)}
                                </div>
                              </div>
                              {team.description && (
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Açıklama</Label>
                                  <p className="mt-1 text-sm text-gray-600">{team.description}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{team.phoneNumber}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {getStageLabel(team.stage)}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {renderAgeGroupsWithCounts(team.ageGroups.slice(0, 4), team.ageGroupTeamCounts)}
                          {team.ageGroups.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{team.ageGroups.length - 4}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(team.createdAt).toLocaleDateString("tr-TR")}
                        </div>
                        
                        {team.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 pt-1">
                            {team.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {totalTeams > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sayfa başına:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-600">
                {startIndex + 1}-{Math.min(endIndex, totalTeams)} / {totalTeams} takım
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Önceki
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Sonraki
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
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

      {/* Team Edit Dialog */}
      <Dialog open={showEditTeamDialog} onOpenChange={setShowEditTeamDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Takım Düzenle</DialogTitle>
            <DialogDescription>
              Takım bilgilerini düzenleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-teamName">Takım Adı</Label>
              <Input
                id="edit-teamName"
                value={editTeamData.teamName}
                onChange={(e) => setEditTeamData({ ...editTeamData, teamName: e.target.value })}
                placeholder="Takım adı"
              />
            </div>
            <div>
              <Label htmlFor="edit-coachName">Antrenör Adı</Label>
              <Input
                id="edit-coachName"
                value={editTeamData.coachName}
                onChange={(e) => setEditTeamData({ ...editTeamData, coachName: e.target.value })}
                placeholder="Antrenör adı"
              />
            </div>
            <div>
              <Label htmlFor="edit-phoneNumber">Telefon Numarası</Label>
              <Input
                id="edit-phoneNumber"
                value={editTeamData.phoneNumber}
                onChange={(e) => setEditTeamData({ ...editTeamData, phoneNumber: e.target.value })}
                placeholder="Telefon numarası"
              />
            </div>
            <div>
              <Label htmlFor="edit-stage">Etap</Label>
              <Select
                value={editTeamData.stage}
                onValueChange={(value) => setEditTeamData({ ...editTeamData, stage: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Etap seçin" />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Yaş Grupları ve Takım Sayıları</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {AGE_GROUPS.map((ageGroup) => (
                  <div key={ageGroup.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      checked={editTeamData.ageGroups.includes(ageGroup.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditTeamData({
                            ...editTeamData,
                            ageGroups: [...editTeamData.ageGroups, ageGroup.value],
                            ageGroupTeamCounts: {
                              ...editTeamData.ageGroupTeamCounts,
                              [ageGroup.value]: 1
                            }
                          });
                        } else {
                          const newAgeGroups = editTeamData.ageGroups.filter(ag => ag !== ageGroup.value);
                          const newCounts = { ...editTeamData.ageGroupTeamCounts };
                          delete newCounts[ageGroup.value];
                          setEditTeamData({
                            ...editTeamData,
                            ageGroups: newAgeGroups,
                            ageGroupTeamCounts: newCounts
                          });
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium min-w-[50px]">{ageGroup.label}</span>
                    {editTeamData.ageGroups.includes(ageGroup.value) && (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            const currentCount = editTeamData.ageGroupTeamCounts[ageGroup.value] || 1;
                            if (currentCount > 1) {
                              setEditTeamData({
                                ...editTeamData,
                                ageGroupTeamCounts: {
                                  ...editTeamData.ageGroupTeamCounts,
                                  [ageGroup.value]: currentCount - 1
                                }
                              });
                            }
                          }}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="min-w-[20px] text-center text-sm">
                          {editTeamData.ageGroupTeamCounts[ageGroup.value] || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const currentCount = editTeamData.ageGroupTeamCounts[ageGroup.value] || 1;
                            setEditTeamData({
                              ...editTeamData,
                              ageGroupTeamCounts: {
                                ...editTeamData.ageGroupTeamCounts,
                                [ageGroup.value]: currentCount + 1
                              }
                            });
                          }}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Açıklama</Label>
              <Input
                id="edit-description"
                value={editTeamData.description || ""}
                onChange={(e) => setEditTeamData({ ...editTeamData, description: e.target.value })}
                placeholder="Takım açıklaması (opsiyonel)"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditTeamDialog(false);
                  setSelectedTeam(null);
                  setEditTeamData({
                    teamName: "",
                    coachName: "",
                    phoneNumber: "",
                    stage: "",
                    ageGroups: [],
                    ageGroupTeamCounts: {},
                    description: "",
                    logoUrl: ""
                  });
                }}
              >
                İptal
              </Button>
              <Button
                onClick={handleUpdateTeam}
                disabled={teamActionLoading || !editTeamData.teamName || !editTeamData.coachName || !editTeamData.phoneNumber || !editTeamData.stage}
              >
                {teamActionLoading ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}