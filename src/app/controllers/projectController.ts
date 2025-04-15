'use server'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type PrismaModel = {
  update: (args: { 
    where: any;
    data: any
  }) => Promise<any>,
  updateMany: (args: { 
    where: any;
    data: any
  }) => Promise<any>
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

// List 이름 변경
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

// List 이동 (order, parentId 변경)
export async function moveList({
  type,
  id,
  originalParentId,
  updateParentId,
  originalOrder,
  updateOrder
} : {
  type: keyof typeof prismaTable;
  id: number,
  originalParentId: number,
  updateParentId: number,
  originalOrder: number,
  updateOrder: number
}) {
  try {
    const model = prismaTable[type] as unknown as PrismaModel;

    // source parent order 변경
    await model.updateMany({
      where: {
        ORDER: { gt: originalOrder },
        ...(type !== "project" && { PARENT_ID: originalParentId })
      },
      data: { ORDER: { decrement: 1 } },
    });

    // target parent order 변경
    await model.updateMany({
      where: {
        ORDER: { gte: updateOrder },
        ...(type !== "project" && { PARENT_ID: updateParentId })
      },
      data: { ORDER: { increment: 1 } },
    });

    // 대상의 parentId, order 변경
    const data: Record<string, any> = {
      ORDER: updateOrder,
      ...(type !== "project" && { PARENT_ID: updateParentId }) // 조건부
    };
    await model.update({
      where: { ID: id },
      data,
    });
  } catch (error) {
    console.error('프로젝트 이름 업데이트 실패:', error);
    throw new Error('프로젝트 이름 업데이트에 실패했습니다.');
  }
}