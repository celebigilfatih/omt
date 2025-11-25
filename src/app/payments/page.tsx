"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Plus, Search, Calendar, Pencil, Trash2 } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Types
interface Team {
  id: string;
  teamName: string;
  coachName: string;
  phoneNumber: string;
  stage: string;
  athletePrice: number;
  parentPrice: number;
}

interface Payment {
  id: string;
  teamId: string;
  paymentMethod: string;
  amount: number;
  description?: string;
  createdAt: string;
  team: Team;
}

const PAYMENT_METHODS = [
  { value: "POS", label: "POS Ödemesi" },
  { value: "IBAN", label: "İBAN Havalesi" },
  { value: "CASH", label: "Nakit Ödeme" },
  { value: "HAND_DELIVERY", label: "Elden Ödeme" },
  { value: "MAIL_ORDER", label: "Mail Order" },
  { value: "HOTEL_PAYMENT", label: "Otele Ödeme" },
];

export default function PaymentsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  
  // Form states
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Edit form states
  const [editPaymentMethod, setEditPaymentMethod] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Check authentication
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/admin/login");
      return;
    }
  }, [router]);

  // Fetch teams and payments
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      return;
    }

    const fetchData = async () => {
      try {
        const [teamsRes, paymentsRes] = await Promise.all([
          fetch("/api/teams"),
          fetch("/api/payments")
        ]);

        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setTeams(teamsData);
        }

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(paymentsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
    const team = teams.find(t => t.id === teamId);
    setSelectedTeam(team || null);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId: selectedTeamId,
          paymentMethod,
          amount: parseFloat(amount),
          description: description || undefined,
        }),
      });

      if (response.ok) {
        const newPayment = await response.json();
        setPayments([newPayment, ...payments]);
        
        // Reset all form fields including team selection
        setSelectedTeamId("");
        setSelectedTeam(null);
        setPaymentMethod("");
        setAmount("");
        setDescription("");
        
        alert("Ödeme başarıyla kaydedildi!");
      } else {
        const error = await response.json();
        alert(error.error || "Ödeme kaydedilemedi");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setEditPaymentMethod(payment.paymentMethod);
    setEditAmount(payment.amount.toString());
    setEditDescription(payment.description || "");
    setShowEditDialog(true);
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    
    setSubmitting(true);

    try {
      const response = await fetch(`/api/payments/${editingPayment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: editPaymentMethod,
          amount: parseFloat(editAmount),
          description: editDescription || undefined,
        }),
      });

      if (response.ok) {
        const updatedPayment = await response.json();
        setPayments(payments.map(p => p.id === updatedPayment.id ? updatedPayment : p));
        
        setShowEditDialog(false);
        setEditingPayment(null);
        setEditPaymentMethod("");
        setEditAmount("");
        setEditDescription("");
        
        alert("Ödeme başarıyla güncellendi!");
      } else {
        const error = await response.json();
        alert(error.error || "Ödeme güncellenemedi");
      }
    } catch (error) {
      console.error("Update payment error:", error);
      alert("Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Bu ödeme kaydını silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPayments(payments.filter(p => p.id !== paymentId));
        alert("Ödeme başarıyla silindi!");
      } else {
        const error = await response.json();
        alert(error.error || "Ödeme silinemedi");
      }
    } catch (error) {
      console.error("Delete payment error:", error);
      alert("Bir hata oluştu");
    }
  };

  const getStageLabel = (stage: string) => {
    const stages: Record<string, string> = {
      STAGE_1: "1. Etap",
      STAGE_2: "2. Etap",
      STAGE_3: "3. Etap",
      STAGE_4: "4. Etap",
      FINAL: "Final",
    };
    return stages[stage] || stage;
  };

  const getPaymentMethodLabel = (method: string) => {
    return PAYMENT_METHODS.find(m => m.value === method)?.label || method;
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      POS: "bg-blue-100 text-blue-800",
      IBAN: "bg-green-100 text-green-800",
      CASH: "bg-yellow-100 text-yellow-800",
      HAND_DELIVERY: "bg-purple-100 text-purple-800",
      MAIL_ORDER: "bg-pink-100 text-pink-800",
      HOTEL_PAYMENT: "bg-orange-100 text-orange-800",
    };
    
    return colors[method] || "bg-gray-100 text-gray-800";
  };

  const filteredPayments = payments.filter(payment =>
    payment.team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.team.coachName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPaymentMethodLabel(payment.paymentMethod).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getStageLabel(payment.team.stage).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Calculate payment summary by team
  const teamPaymentSummary = payments.reduce((acc, payment) => {
    if (!acc[payment.teamId]) {
      acc[payment.teamId] = {
        team: payment.team,
        totalAmount: 0,
        paymentCount: 0,
        methods: new Set<string>(),
      };
    }
    acc[payment.teamId].totalAmount += payment.amount;
    acc[payment.teamId].paymentCount += 1;
    acc[payment.teamId].methods.add(payment.paymentMethod);
    return acc;
  }, {} as Record<string, { team: Team; totalAmount: number; paymentCount: number; methods: Set<string> }>);

  const teamSummaryArray = Object.values(teamPaymentSummary).sort(
    (a, b) => b.totalAmount - a.totalAmount
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl text-blue-600">₺</span>
          <p className="mt-4 text-lg text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">₺</span>
            Ödeme Yönetimi
          </h1>
          <p className="mt-2 text-gray-600">
            Takım ödemelerini kaydedin ve takip edin. Her takım için birden fazla ödeme kaydı oluşturabilirsiniz.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Toplam Ödeme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {payments.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Toplam Tutar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₺{totalAmount.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Kayıtlı Takım
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {teams.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Toplam takım sayısı</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Takım adı, antrenör, ödeme yöntemi veya etap ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Ödeme
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Yeni Ödeme Kaydı</DialogTitle>
                    <DialogDescription>
                      Takım seçimi yapın ve ödeme bilgilerini girin. Aynı takım için birden fazla ödeme ekleyebilirsiniz.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmitPayment} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="team">Takım *</Label>
                      <Select value={selectedTeamId} onValueChange={handleTeamSelect} required>
                        <SelectTrigger id="team">
                          <SelectValue placeholder="Takım seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.teamName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedTeam && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
                        <div>
                          <Label className="text-sm text-gray-600">Sporcu Ücreti</Label>
                          <div className="mt-1 font-semibold text-blue-600">₺{selectedTeam.athletePrice.toFixed(2)}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Veli Ücreti</Label>
                          <div className="mt-1 font-semibold text-purple-600">₺{selectedTeam.parentPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="paymentMethod">Ödeme Yöntemi *</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                        <SelectTrigger id="paymentMethod">
                          <SelectValue placeholder="Ödeme yöntemi seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">Tutar (₺) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Açıklama</Label>
                      <Textarea
                        id="description"
                        placeholder="Ödeme ile ilgili notlar..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-between gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddDialog(false);
                          setSelectedTeamId("");
                          setSelectedTeam(null);
                          setPaymentMethod("");
                          setAmount("");
                          setDescription("");
                        }}
                        disabled={submitting}
                      >
                        Kapat
                      </Button>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setPaymentMethod("");
                            setAmount("");
                            setDescription("");
                          }}
                          disabled={submitting}
                        >
                          Temizle
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Edit Payment Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ödeme Kaydını Düzenle</DialogTitle>
              <DialogDescription>
                {editingPayment && (
                  <span className="font-medium">
                    {editingPayment.team.teamName} - {editingPayment.team.coachName}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdatePayment} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="editPaymentMethod">Ödeme Yöntemi *</Label>
                <Select value={editPaymentMethod} onValueChange={setEditPaymentMethod} required>
                  <SelectTrigger id="editPaymentMethod">
                    <SelectValue placeholder="Ödeme yöntemi seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editAmount">Tutar (₺) *</Label>
                <Input
                  id="editAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="editDescription">Açıklama</Label>
                <Textarea
                  id="editDescription"
                  placeholder="Ödeme ile ilgili notlar..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingPayment(null);
                    setEditPaymentMethod("");
                    setEditAmount("");
                    setEditDescription("");
                  }}
                  disabled={submitting}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                  {submitting ? "Güncelleniyor..." : "Güncelle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Payments List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ödeme Kayıtları</CardTitle>
            <CardDescription>
              {filteredPayments.length} ödeme kaydı bulundu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl text-gray-400">₺</span>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Ödeme kaydı bulunamadı
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? "Arama kriterleri ile eşleşen ödeme bulunamadı" : "Henüz ödeme kaydı eklenmemiş"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Takım Adı</TableHead>
                      <TableHead>Antrenör</TableHead>
                      <TableHead>Etap</TableHead>
                      <TableHead>Sporcu Ücreti</TableHead>
                      <TableHead>Veli Ücreti</TableHead>
                      <TableHead>Ödeme Yöntemi</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead className="text-center">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.team.teamName}
                        </TableCell>
                        <TableCell>{payment.team.coachName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getStageLabel(payment.team.stage)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-600 font-medium">
                          ₺{payment.team.athletePrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-purple-600 font-medium">
                          ₺{payment.team.parentPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPaymentMethodBadge(payment.paymentMethod)}>
                            {getPaymentMethodLabel(payment.paymentMethod)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          ₺{payment.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {payment.description || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(payment.createdAt).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPayment(payment)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePayment(payment.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Payment Summary */}
        {teamSummaryArray.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Takımlara Göre Ödeme Özeti</CardTitle>
              <CardDescription>
                Her takım için toplam ödeme miktarı ve yöntemleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamSummaryArray.map((summary) => (
                  <Card key={summary.team.id} className="border-2 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {summary.team.teamName}
                          </h3>
                          <p className="text-sm text-gray-600">{summary.team.coachName}</p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {summary.paymentCount} ödeme
                        </Badge>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Toplam Tutar:</span>
                          <span className="text-lg font-bold text-green-600">
                            ₺{summary.totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Array.from(summary.methods).map((method) => (
                            <Badge
                              key={method}
                              className={`text-xs ${getPaymentMethodBadge(method)}`}
                            >
                              {getPaymentMethodLabel(method)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
