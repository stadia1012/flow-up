'use server'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function updateProjectName(projectId: number, newName: string) {
  try {
    const updatedProject = await prisma.w_PROJECTS.update({
      where: { ID: projectId },
      data: { NAME: newName },
    });
    return updatedProject;
  } catch (error) {
    console.error('프로젝트 이름 업데이트 실패:', error);
    throw new Error('프로젝트 이름 업데이트에 실패했습니다.');
  }
}