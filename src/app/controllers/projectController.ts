'use server'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type PrismaModel = {
  update: (args: { where: { ID: number }; data: { NAME: string } }) => Promise<any>;
};

// List 요소 이름 변경
export async function updateListName(id: number, newName: string, type: string) {
  let model :PrismaModel
  switch (type) {
    case 'folder':
      model = prisma.w_FOLDERS; // 실제 모델명 확인 필수
      break;
    case 'project':
      model = prisma.w_PROJECTS; // 실제 모델명 확인 필수
      break;
    default:
      throw new Error('잘못된 타입입니다.');
  }
  try {
    const updatedProject = await model.update({
      where: { ID: id },
      data: { NAME: newName },
    });
    return updatedProject;
  } catch (error) {
    console.error('프로젝트 이름 업데이트 실패:', error);
    throw new Error('프로젝트 이름 업데이트에 실패했습니다.');
  }
}

// folder 이동
export async function updateParentId(folderId: number, parentId: number) {
  try {
    const updatedFolder = await prisma.w_FOLDERS.update({
      where: { ID: folderId },
      data: { PARENT_ID: parentId },
    });
    return updatedFolder;
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
      parentId: folder.PARENT_ID ?? undefined,
      name: folder.NAME ?? '',
      isFolded: true,
      lists: folder.items.map((item) => ({
        id: item.ID,
        parentId: item.PARENT_ID ?? undefined,
        name: item.NAME ?? '',
      })),
    })),
  }));
}

// folder 가져오기
export async function getFolders(projectId: number): Promise<List[]> {
  const folders = await prisma.w_FOLDERS.findMany({
    include: {
      items: true,
    },
    where: {
      PARENT_ID: projectId,
    }
  });

  return folders.map((folder) => ({
    id: folder.ID,
    name: folder.NAME ?? '',
    isFolded: true,
    lists: folder.items.map((folder) => ({
      id: folder.ID,
      parentId: folder.PARENT_ID ?? undefined,
      name: folder.NAME ?? '',
      isFolded: false,
    })),
  }));
}