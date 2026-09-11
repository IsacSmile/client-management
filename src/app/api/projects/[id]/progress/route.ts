import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { progress, status } = await request.json();
    const numProgress = parseInt(progress, 10);

    if (isNaN(numProgress) || numProgress < 0 || numProgress > 100) {
      return NextResponse.json({ error: 'Progress must be a number between 0 and 100' }, { status: 400 });
    }

    const updateData: { progress: number; status?: string } = { progress: numProgress };
    if (status) {
      updateData.status = status;
    } else if (numProgress === 100) {
      updateData.status = 'Completed';
    }

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error('Update progress error:', error);
    return NextResponse.json({ error: 'Failed to update project progress' }, { status: 500 });
  }
}
