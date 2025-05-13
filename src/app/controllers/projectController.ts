'use server'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type PrismaModel = {
  update: (args: any) => Promise<any>,
  updateMany: (args: any) => Promise<any>,
  create: (args: any) => Promise<any>,
  delete: (args: any) => Promise<any>,
  aggregate: (args: any) => Promise<any>,
  findUnique: (args: any) => Promise<any>,
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
          items: {
            where: {
              IS_DELETED: 'N',
            },
          },
        },
        where: {
          IS_DELETED: 'N',
        },
      },
    },
    where: {
      IS_DELETED: 'N',
    },
  });

  return projects.map((project) => ({
    type: 'project',
    id: project.ID,
    name: project.NAME ?? '',
    iconColor: project.ICON_COLOR ?? '000000', 
    order: project.ORDER ?? 0,
    isFolded: true,
    lists: project.folders.map((folder) => ({
      type: 'folder',
      id: folder.ID,
      parentId: project.ID ?? undefined,
      name: folder.NAME ?? '',
      iconColor: folder.ICON_COLOR ?? '000000', 
      order: folder.ORDER ?? 0,
      isFolded: true,
      lists: folder.items.map((item) => ({
        type: 'item',
        id: item.ID,
        parentId: folder.ID ?? undefined,
        name: item.NAME ?? '',
        iconColor: item.ICON_COLOR ?? '000000', 
        order: item.ORDER ?? 0,
      })),
    })),
  }));
}

// getProject
export async function getList({type, id} : {type: ListType; id: number}): Promise<List | undefined> {
  try {
    const model = prismaTable[type] as unknown as PrismaModel;
    const data = await model.findUnique({
      where: { ID: id}
    });
    if (!data) return;
    return {
      type: type,
      id: data.ID,
      parentId: data.PARENT_ID ?? 0,
      name: data.NAME ?? '',
      iconColor: data.ICON_COLOR ?? '000000', 
      order: data.ORDER ?? 0,
    }
  } catch (error) {
    console.error('project 조회 실패:', error);
    throw new Error('project 조회 실패');
  }
}

// name 변경
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
    console.error('item name 업데이트 실패:', error);
    throw new Error('item name 업데이트 실패');
  }
}

// IconColor 변경
export async function updateItemIconColor({
  type,
  id,
  newHex,
}: {
  type: ListType;
  id: number;
  newHex: string;
}) {
  try {
    const model = prismaTable[type] as unknown as PrismaModel;
    const result = await model.update({
      where: { ID: id },
      data: { ICON_COLOR: newHex },
    });
    return result;
  } catch (error) {
    console.error('item IconColor 업데이트 실패:', error);
    throw new Error('item IconColor 업데이트 실패');
  }
}

// item 이동 (order, parentId 변경)
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
    console.error('item 이동 실패:', error);
    throw new Error('item 이동 실패');
  }
}

// item 추가
export async function addItemToDB({
  type,
  parentId,
  name,
  iconColor,
}: {
  type: ListType;
  parentId?: number;
  name: string;
  iconColor: string;
}) {
  const now = new Date();
  try {
    const model = prismaTable[type] as PrismaModel;
    const maxOrder = await model.aggregate({
      where: {
        ...(type !== "project" && { PARENT_ID: parentId }),
      },
      _max: {
        ORDER: true
      }
    })

    const result = await model.create({
      data: {
        NAME: name,
        ICON_COLOR: iconColor,
        // REG_ID: 'userId', // 추후에 추가예정
        ORDER: (maxOrder._max.ORDER ?? -1) + 1,
        REG_DT: now,
        ...(type !== "project" && { PARENT_ID: parentId }), // 조건부
      },
    })

    // default field 'Name'
    if (type === "item") {
      await prisma.w_FIELDS.create({
        data: {
          ITEM_ID: result.ID,
          ORDER: 0,
          NAME: "Name",
          FIELD_TYPE: 'name',
          REG_ID: 'system',
          REG_DT: now,
        },
      });
    }
    return result;
  } catch (error) {
    console.error('item 추가 실패:', error);
    throw new Error('item 추가 실패:');
  }
}

export async function deleteItemFromDB({
  itemType,
  itemId,
}: {
  itemType: ListType;
  itemId: number;
}) {
  try {
    const model = prismaTable[itemType] as unknown as PrismaModel;

    const result = await model.update({
      where: { ID: itemId },
      data: { IS_DELETED: 'Y' },
    });
    return result;
  } catch (error) {
    console.error('item 삭제 실패:', error);
    throw new Error('item 삭제 실패');
  }
}