import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { teamName, coachName, phoneNumber, stage, ageGroups, ageGroupTeamCounts, description } = await request.json();

    if (!teamName || !coachName || !phoneNumber || !stage) {
      return NextResponse.json(
        { message: "Gerekli alanlar eksik" },
        { status: 400 }
      );
    }

    const updateData: any = {
      teamName,
      coachName,
      phoneNumber,
      stage,
      ageGroups,
      description: description || null,
    };

    if (ageGroupTeamCounts) {
      updateData.ageGroupTeamCounts = ageGroupTeamCounts;
    }

    const updatedTeam = await prisma.team.update({
      where: { id: params.id },
      data: updateData
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.team.delete({
      where: { id: params.id }
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