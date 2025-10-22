"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Filter,
  Eye,
  Phone,
  Trophy,
  Edit,
  Trash2,
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

interface Team {
  id: string;
  teamName: string;
  coachName: string;
  phoneNumber: string;
  email?: string;
  stage: string;
  ageGroups: string[];
  ageGroupTeamCounts?: Record<string, number>;
  description?: string;
  logoUrl?: string;
  status?: string;
  createdAt: string;
}

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

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showEditTeamDialog, setShowEditTeamDialog] = useState(false);
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
  const [sortField, setSortField] = useState<keyof Team>("teamName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Check authentication
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/admin/login");
    }
  }, [router]);

  // Fetch teams data
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/teams");
        if (response.ok) {
          const data = await response.json();
          console.log("Takımlar yüklendi:", data);
          console.log("İlk takımın ageGroupTeamCounts:", data[0]?.ageGroupTeamCounts);
          setTeams(data);
        }
      } catch (error) {
        console.error("Takımlar yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

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

  const handleUpdateTeam = async () => {
    if (!selectedTeam) return;

    setTeamActionLoading(true);
    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editTeamData),
      });

      if (response.ok) {
        // Refresh teams data
        const teamsResponse = await fetch("/api/teams");
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

  const handleDeleteTeam = async (teamId: string) => {
    setTeamActionLoading(true);
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh teams data
        const teamsResponse = await fetch("/api/teams");
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

  // Filter teams
  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.coachName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = !stageFilter || stageFilter === "all" || team.stage === stageFilter;
    const matchesAgeGroup = !ageGroupFilter || ageGroupFilter === "all" || team.ageGroups.includes(ageGroupFilter);
    
    return matchesSearch && matchesStage && matchesAgeGroup;
  });

  // Sort teams
  const sortedTeams = [...filteredTeams].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedTeams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTeams = sortedTeams.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof Team) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Team) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Takımlar</h1>
            <p className="text-gray-600 mt-2">Tüm takımları görüntüleyin ve yönetin</p>
          </div>
          <Button 
            onClick={() => router.push("/admin")}
            variant="outline"
          >
            Admin Paneline Dön
          </Button>
        </div>

        {/* Stats Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Takım İstatistikleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{teams.length}</div>
                <div className="text-sm text-gray-600">Toplam Takım</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {teams.filter(t => t.stage === "STAGE_1").length}
                </div>
                <div className="text-sm text-gray-600">1. Etap</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {teams.filter(t => t.stage === "STAGE_2").length}
                </div>
                <div className="text-sm text-gray-600">2. Etap</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredTeams.length}
                </div>
                <div className="text-sm text-gray-600">Filtrelenmiş</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {teams.reduce((total, team) => total + team.ageGroups.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Toplam Yaş Grupları</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Takım veya antrenör ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
              <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Yaş grubu seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Yaş Grupları</SelectItem>
                  {AGE_GROUPS.map((ageGroup) => (
                    <SelectItem key={ageGroup.value} value={ageGroup.value}>
                      {ageGroup.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStageFilter("");
                  setAgeGroupFilter("");
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtreleri Temizle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teams Table - Desktop */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("teamName")}
                  >
                    <div className="flex items-center gap-2">
                      Takım Adı
                      {getSortIcon("teamName")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("coachName")}
                  >
                    <div className="flex items-center gap-2">
                      Antrenör
                      {getSortIcon("coachName")}
                    </div>
                  </TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("stage")}
                  >
                    <div className="flex items-center gap-2">
                      Etap
                      {getSortIcon("stage")}
                    </div>
                  </TableHead>
                  <TableHead>Yaş Grupları</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTeams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.teamName}</TableCell>
                    <TableCell>{team.coachName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {team.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {STAGES.find(s => s.value === team.stage)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {team.ageGroups.map((ageGroup) => {
                          const count = team.ageGroupTeamCounts?.[ageGroup] || 1;
                          return (
                            <Badge key={ageGroup} variant="secondary" className="text-xs">
                              {AGE_GROUPS.find(ag => ag.value === ageGroup)?.label} ({count})
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTeam(team)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{team.teamName} - Detaylar</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Takım Adı</Label>
                                <p className="mt-1">{team.teamName}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Antrenör</Label>
                                <p className="mt-1">{team.coachName}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Telefon</Label>
                                <p className="mt-1">{team.phoneNumber}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Etap</Label>
                                <p className="mt-1">{STAGES.find(s => s.value === team.stage)?.label}</p>
                              </div>
                              <div className="col-span-2">
                                <Label className="text-sm font-medium text-gray-500">Yaş Grupları</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {team.ageGroups.map((ageGroup) => (
                                    <Badge key={ageGroup} variant="secondary">
                                      {AGE_GROUPS.find(ag => ag.value === ageGroup)?.label}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="col-span-2">
                                <Label className="text-sm font-medium text-gray-500">Yaş Grubu Takım Sayıları</Label>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                  {team.ageGroups.map((ageGroup) => {
                                    const count = team.ageGroupTeamCounts?.[ageGroup] || 1;
                                    console.log(`Takım: ${team.teamName}, Yaş Grubu: ${ageGroup}, Count: ${count}, ageGroupTeamCounts:`, team.ageGroupTeamCounts);
                                    return (
                                      <div key={ageGroup} className="text-sm">
                                        <span className="font-medium">
                                          {AGE_GROUPS.find(ag => ag.value === ageGroup)?.label}:
                                        </span> {count}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              {team.description && (
                                <div className="col-span-2">
                                  <Label className="text-sm font-medium text-gray-500">Açıklama</Label>
                                  <p className="mt-1 text-sm">{team.description}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTeam(team)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Takımı Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                {team.teamName} takımını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

        {/* Teams Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {paginatedTeams.map((team) => (
            <Card key={team.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{team.teamName}</h3>
                    <p className="text-gray-600">{team.coachName}</p>
                  </div>
                  <Badge variant="outline">
                    {STAGES.find(s => s.value === team.stage)?.label}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {team.phoneNumber}
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Yaş Grupları:</div>
                    <div className="flex flex-wrap gap-1">
                      {team.ageGroups.map((ageGroup) => (
                        <Badge key={ageGroup} variant="secondary" className="text-xs">
                          {AGE_GROUPS.find(ag => ag.value === ageGroup)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {team.description && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Açıklama:</div>
                      <p className="text-sm">{team.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTeam(team)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detay
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{team.teamName} - Detaylar</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Takım Adı</Label>
                          <p className="mt-1">{team.teamName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Antrenör</Label>
                          <p className="mt-1">{team.coachName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Telefon</Label>
                          <p className="mt-1">{team.phoneNumber}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Etap</Label>
                          <p className="mt-1">{STAGES.find(s => s.value === team.stage)?.label}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Yaş Grupları</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {team.ageGroups.map((ageGroup) => (
                              <Badge key={ageGroup} variant="secondary">
                                {AGE_GROUPS.find(ag => ag.value === ageGroup)?.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {team.ageGroupTeamCounts && Object.keys(team.ageGroupTeamCounts).length > 0 && (
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Yaş Grubu Takım Sayıları</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {Object.entries(team.ageGroupTeamCounts).map(([ageGroup, count]) => (
                                <div key={ageGroup} className="text-sm">
                                  <span className="font-medium">
                                    {AGE_GROUPS.find(ag => ag.value === ageGroup)?.label}:
                                  </span> {count}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {team.description && (
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Açıklama</Label>
                            <p className="mt-1 text-sm">{team.description}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTeam(team)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Düzenle
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sil
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Takımı Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          {team.teamName} takımını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sayfa başına:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(parseInt(value));
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
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Sayfa {currentPage} / {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Team Dialog */}
        <Dialog open={showEditTeamDialog} onOpenChange={setShowEditTeamDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Takımı Düzenle</DialogTitle>
              <DialogDescription>
                Takım bilgilerini güncelleyin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamName">Takım Adı</Label>
                <Input
                  id="teamName"
                  value={editTeamData.teamName}
                  onChange={(e) => setEditTeamData({...editTeamData, teamName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="coachName">Antrenör Adı</Label>
                <Input
                  id="coachName"
                  value={editTeamData.coachName}
                  onChange={(e) => setEditTeamData({...editTeamData, coachName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Telefon</Label>
                <Input
                  id="phoneNumber"
                  value={editTeamData.phoneNumber}
                  onChange={(e) => setEditTeamData({...editTeamData, phoneNumber: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="stage">Etap</Label>
                <Select
                  value={editTeamData.stage}
                  onValueChange={(value) => setEditTeamData({...editTeamData, stage: value})}
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
              <div className="col-span-2">
                <Label>Yaş Grupları</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {AGE_GROUPS.map((ageGroup) => (
                    <label key={ageGroup.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editTeamData.ageGroups.includes(ageGroup.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditTeamData({
                              ...editTeamData,
                              ageGroups: [...editTeamData.ageGroups, ageGroup.value]
                            });
                          } else {
                            setEditTeamData({
                              ...editTeamData,
                              ageGroups: editTeamData.ageGroups.filter(ag => ag !== ageGroup.value)
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{ageGroup.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <Label>Yaş Grubu Takım Sayıları</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {editTeamData.ageGroups.map((ageGroup) => (
                    <div key={ageGroup}>
                      <Label className="text-sm">
                        {AGE_GROUPS.find(ag => ag.value === ageGroup)?.label}
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={editTeamData.ageGroupTeamCounts[ageGroup] || ""}
                        onChange={(e) => setEditTeamData({
                          ...editTeamData,
                          ageGroupTeamCounts: {
                            ...editTeamData.ageGroupTeamCounts,
                            [ageGroup]: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Açıklama</Label>
                <Input
                  id="description"
                  value={editTeamData.description}
                  onChange={(e) => setEditTeamData({...editTeamData, description: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={editTeamData.logoUrl}
                  onChange={(e) => setEditTeamData({...editTeamData, logoUrl: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditTeamDialog(false)}
              >
                İptal
              </Button>
              <Button
                onClick={handleUpdateTeam}
                disabled={teamActionLoading}
              >
                {teamActionLoading ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}