import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { teamName, coachName, phoneNumber, stage, ageGroups, ageGroupTeamCounts, athletePrice, parentPrice, description, logoUrl } = await request.json();

    if (!teamName || !coachName || !phoneNumber || !stage) {
      return NextResponse.json(
        { message: "Gerekli alanlar eksik" },
        { status: 400 }
      );
    }

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        teamName,
        coachName,
        phoneNumber,
        stage,
        ageGroups,
        ageGroupTeamCounts: ageGroupTeamCounts as Prisma.InputJsonValue,
        athletePrice: athletePrice !== undefined ? athletePrice : 0,
        parentPrice: parentPrice !== undefined ? parentPrice : 0,
        description: description || null,
        logoUrl: logoUrl || null,
      }
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { message: "Takım güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Takımı getir
    const team = await prisma.team.findUnique({
      where: { id }
    });

    if (!team) {
      return NextResponse.json(
        { message: "Takım bulunamadı" },
        { status: 404 }
      );
    }

    // Takımı sil
    await prisma.team.delete({
      where: { id }
    });

    // İlgili başvuruyu bul ve durumunu PENDING'e çevir
    // Takım adı, antrenör ve telefon numarasına göre eşleşen başvuruyu bul
    const relatedApplication = await prisma.teamApplication.findFirst({
      where: {
        teamName: team.teamName,
        coachName: team.coachName,
        phoneNumber: team.phoneNumber,
        status: "APPROVED"
      }
    });

    // Eğer ilgili onaylı başvuru varsa, durumunu PENDING yap
    if (relatedApplication) {
      await prisma.teamApplication.update({
        where: { id: relatedApplication.id },
        data: { status: "PENDING" }
      });
    }

    return NextResponse.json({ 
      message: "Takım başarıyla silindi",
      applicationUpdated: !!relatedApplication
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { message: "Takım silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}