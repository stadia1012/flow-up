'use server'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type PrismaModel = {
  update: (args: { 
    where: { ID: number };
    data: { NAME?: string, PARENT_ID?: number }
  }) => Promise<any>;
};

const prismaTable = {
  'folder': prisma.w_FOLDERS,
  'project': prisma.w_PROJECTS,
  'item': prisma.w_ITEMS
};

// projects 가져오기 
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
    type: 'project',
    id: project.ID,
    name: project.NAME ?? '',
    order: project.ORDER ?? 0,
    isFolded: true,
    lists: project.folders.map((folder) => ({
      type: 'folder',
      id: folder.ID,
      parentId: folder.PARENT_ID ?? undefined,
      name: folder.NAME ?? '',
      order: folder.ORDER ?? 0,
      isFolded: true,
      lists: folder.items.map((item) => ({
        type: 'item',
        id: item.ID,
        parentId: item.PARENT_ID ?? undefined,
        name: item.NAME ?? '',
        order: item.ORDER ?? 0,
      })),
    })),
  }));
}

// 이름 변경
export async function updateListName({
  type,
  id,
  newName,
}: {
  type: keyof typeof prismaTable;
  id: number;
  newName: string;
}) {
  try {
    const model = prismaTable[type] as unknown as PrismaModel;
    const result = await model.update({
      where: { ID: id },
      data: { NAME: newName },
    });
    return result;
  } catch (error) {
    console.error('프로젝트 이름 업데이트 실패:', error);
    throw new Error('프로젝트 이름 업데이트에 실패했습니다.');
  }
}

// parentId 변경 (이동)
export async function updateParentId({
  type,
  id,
  parentId
} : {
  type: keyof typeof prismaTable;
  id: number,
  parentId: number
}) {
  try {
    if (type === "project") return;
    const model = prismaTable[type] as unknown as PrismaModel;
    const result = await model.update({
      where: { ID: id },
      data: { PARENT_ID: parentId },
    });
    return result;
  } catch (error) {
    console.error('프로젝트 이름 업데이트 실패:', error);
    throw new Error('프로젝트 이름 업데이트에 실패했습니다.');
  }
}