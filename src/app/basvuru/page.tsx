"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileText, Send, ArrowLeft, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/ui/file-upload";

const formSchema = z.object({
  teamName: z.string().min(2, "Takım adı en az 2 karakter olmalıdır").max(100, "Takım adı en fazla 100 karakter olabilir"),
  coachName: z.string().min(2, "Antrenör adı en az 2 karakter olmalıdır").max(100, "Antrenör adı en fazla 100 karakter olabilir"),
  phoneNumber: z.string()
    .min(10, "Telefon numarası en az 10 haneli olmalıdır")
    .max(15, "Telefon numarası en fazla 15 haneli olabilir")
    .regex(/^[0-9+\-\s()]+$/, "Geçerli bir telefon numarası formatı giriniz"),
  website: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  stage: z.enum(["STAGE_1", "STAGE_2"], {
    message: "Lütfen bir turnuva etapı seçiniz"
  }),
  ageGroups: z.array(z.enum(["Y2012", "Y2013", "Y2014", "Y2015", "Y2016", "Y2017", "Y2018", "Y2019", "Y2020", "Y2021", "Y2022"])).min(1, "En az bir yaş grubu seçiniz"),
  ageGroupTeamCounts: z.record(z.string(), z.number().min(1, "Takım sayısı en az 1 olmalıdır").max(10, "Takım sayısı en fazla 10 olabilir")).optional(),
  athletePrice: z.string().min(1, "Sporcu ücreti girilmesi zorunludur").transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val >= 0, {
    message: "Geçerli bir fiyat giriniz",
  }),
  parentPrice: z.string().min(1, "Veli ücreti girilmesi zorunludur").transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val >= 0, {
    message: "Geçerli bir fiyat giriniz",
  }),
  description: z.string().max(500, "Açıklama en fazla 500 karakter olabilir").optional(),
});

export default function ApplicationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      teamName: "",
      coachName: "",
      phoneNumber: "",
      website: "",
      instagram: "",
      twitter: "",
      facebook: "",
      stage: undefined,
      ageGroups: [],
      ageGroupTeamCounts: {},
      athletePrice: 0,
      parentPrice: 0,
      description: "",
    },
  });

  useEffect(() => {
    setIsAdmin(isAdminAuthenticated());
  }, []);

  const ageGroupOptions = [
    { id: "Y2012", label: "2012 Doğumlu", year: 2012 },
    { id: "Y2013", label: "2013 Doğumlu", year: 2013 },
    { id: "Y2014", label: "2014 Doğumlu", year: 2014 },
    { id: "Y2015", label: "2015 Doğumlu", year: 2015 },
    { id: "Y2016", label: "2016 Doğumlu", year: 2016 },
    { id: "Y2017", label: "2017 Doğumlu", year: 2017 },
    { id: "Y2018", label: "2018 Doğumlu", year: 2018 },
    { id: "Y2019", label: "2019 Doğumlu", year: 2019 },
    { id: "Y2020", label: "2020 Doğumlu", year: 2020 },
    { id: "Y2021", label: "2021 Doğumlu", year: 2021 },
    { id: "Y2022", label: "2022 Doğumlu", year: 2022 },
  ];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      let logoUrl = '';
      
      // Önce logo dosyasını yükle (eğer varsa)
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('logo', logoFile);
        
        const logoResponse = await fetch('/api/upload', {
          method: 'POST',
          body: logoFormData,
        });
        
        if (logoResponse.ok) {
          const logoData = await logoResponse.json();
          logoUrl = logoData.url;
        }
      }
      
      // Başvuru verilerini hazırla
      const applicationData = {
        ...values,
        logoUrl: logoUrl || undefined,
      };

      console.log('Gönderilen veri:', applicationData);

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Başvuru gönderilirken bir hata oluştu');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Başvuru hatası:', error);
      alert(error instanceof Error ? error.message : 'Başvuru gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}


        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <FileText className="mr-3 h-6 w-6" />
              Turnuva Başvuru Formu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-6">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-green-700 mb-4">
                  Başvurunuz Başarıyla Gönderildi!
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Turnuva başvurunuz alınmıştır ve inceleme sürecine başlanmıştır.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
                  <h3 className="font-semibold text-green-800 mb-2">Sonraki Adımlar</h3>
                  <ul className="text-green-700 space-y-2 text-left">
                    <li>• Başvurunuz 3-5 iş günü içinde değerlendirilecektir</li>
                    <li>• Sonuç hakkında e-posta ile bilgilendirileceksiniz</li>
                    <li>• Ek bilgi gerekirse sizinle iletişime geçilecektir</li>
                  </ul>
                </div>
                <Button 
                  onClick={() => {
                    setIsSubmitted(false);
                    form.reset();
                    setLogoFile(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Yeni Başvuru Yap
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-8">
                {/* Two Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Card 1: Team Information */}
                  <Card className="border-2 border-blue-100 shadow-md">

                    <CardContent className="p-6 space-y-6">
                      <FormField
                        control={form.control}
                        name="teamName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Takım Adı *</FormLabel>
                            <FormControl>
                              <Input placeholder="Takım adınızı giriniz" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="coachName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sorumlu Hoca (Adı Soyadı) *</FormLabel>
                            <FormControl>
                              <Input placeholder="Sorumlu hoca adı soyadı" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>İletişim Bilgileri *</FormLabel>
                            <FormControl>
                              <Input placeholder="0555 123 45 67" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="athletePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sporcu Ücreti (₺) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Sporcu ücretini giriniz" 
                                min="0"
                                step="0.01"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parentPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Veli Ücreti (₺) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Veli ücretini giriniz" 
                                min="0"
                                step="0.01"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Açıklama</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Takımınız hakkında ek bilgiler, özel durumlar veya notlar..."
                                className="resize-none"
                                maxLength={500}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Takım Logosu</label>
                        <FileUpload
                          onFileSelect={setLogoFile}
                          accept="image/*"
                          maxSize={5}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2: Tournament & Social Media Information */}
                  <Card className="border-2 border-green-100 shadow-md">

                    <CardContent className="p-6 space-y-6">
                      <FormField
                        control={form.control}
                        name="stage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Turnuva Etap Bilgileri *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Turnuva etapını seçiniz" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="STAGE_1">1. Etap</SelectItem>
                                <SelectItem value="STAGE_2">2. Etap</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ageGroups"
                        render={() => (
                          <FormItem>
                            <FormLabel>Yaş Grupları *</FormLabel>
                            <div className="space-y-3">
                              {ageGroupOptions.map((item) => (
                                <FormField
                                  key={item.id}
                                  control={form.control}
                                  name="ageGroups"
                                  render={({ field }) => {
                                    const isChecked = field.value?.includes(item.id as any);
                                    return (
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-3">
                                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                              <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={(checked) => {
                                                  const currentTeamCounts = form.getValues("ageGroupTeamCounts") || {};
                                                  
                                                  if (checked) {
                                                    field.onChange([...field.value, item.id]);
                                                    // Yaş grubu seçildiğinde varsayılan olarak 1 takım ekle
                                                    form.setValue("ageGroupTeamCounts", {
                                                      ...currentTeamCounts,
                                                      [item.id]: 1
                                                    });
                                                  } else {
                                                    field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== item.id
                                                      )
                                                    );
                                                    // Yaş grubu kaldırıldığında takım sayısını da kaldır
                                                    const newTeamCounts = { ...currentTeamCounts };
                                                    delete newTeamCounts[item.id];
                                                    form.setValue("ageGroupTeamCounts", newTeamCounts);
                                                  }
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="text-sm font-normal">
                                              {item.label}
                                            </FormLabel>
                                          </FormItem>
                                        </div>
                                        
                                        {/* Yaş grubu seçildiğinde takım sayısı girme alanı */}
                                        {isChecked && (
                                          <div className="ml-6">
                                            <FormField
                                              control={form.control}
                                              name="ageGroupTeamCounts"
                                              render={({ field: teamCountField }) => (
                                                <FormItem>
                                                  <FormLabel className="text-xs text-muted-foreground">
                                                    {item.label} için takım sayısı
                                                  </FormLabel>
                                                  <FormControl>
                                                    <Input
                                                      type="number"
                                                      min="1"
                                                      max="10"
                                                      className="w-20"
                                                      value={teamCountField.value?.[item.id] || 1}
                                                      onChange={(e) => {
                                                        const count = parseInt(e.target.value) || 1;
                                                        teamCountField.onChange({
                                                          ...teamCountField.value,
                                                          [item.id]: count
                                                        });
                                                      }}
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />



                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Web Sitesi Linki</FormLabel>
                            <FormControl>
                              <Input type="url" placeholder="https://www.ornek.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input placeholder="@kullanici_adi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter</FormLabel>
                            <FormControl>
                              <Input placeholder="@kullanici_adi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                              <Input placeholder="facebook.com/sayfa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Başvuruyu Gönder
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}

      </div>
    </div>
  );
}
