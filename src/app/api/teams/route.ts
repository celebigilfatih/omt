import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { message: "Takımlar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, teamName, coachName, phoneNumber, stage, ageGroups, ageGroupTeamCounts, description } = await request.json();

    if (!id || !teamName || !coachName || !phoneNumber || !stage) {
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
        ageGroupTeamCounts: ageGroupTeamCounts || {},
        description: description || null,
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: "Takım ID'si gerekli" },
        { status: 400 }
      );
    }

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