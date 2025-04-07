'use server'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// project 이름 변경
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

// project 가져오기
export async function getProjects(): Promise<List[]> {
  const projects = await prisma.w_PROJECTS.findMany({
    include: {
      folders: {
        include: {
          items: true,
        },
      },
    },
  });

  return projects.map((project) => ({
    id: project.ID,
    name: project.NAME ?? '',
    isFolded: true,
    lists: project.folders.map((folder) => ({
      id: folder.ID,
      name: folder.NAME ?? '',
      isFolded: true,
      lists: folder.items.map((item) => ({
        id: item.ID,
        name: item.NAME ?? '',
      })),
    })),
  }));
}