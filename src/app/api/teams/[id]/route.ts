import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { teamName, coachName, phoneNumber, stage, ageGroups, ageGroupTeamCounts, description, logoUrl } = await request.json();

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
    await prisma.team.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Takım başarıyla silindi" });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { message: "Takım silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}