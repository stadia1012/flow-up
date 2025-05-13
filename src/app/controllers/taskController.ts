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

// row order 변경
export async function moveTaskRow({
  rowId,
  sourceOrder,
  updateOrder,
}: {
  rowId: number;
  sourceOrder: number;
  updateOrder: number;
}) {
  try {
    if (updateOrder > sourceOrder) {
      // 후순서로 이동
      await prisma.w_ROWS.updateMany({
        where: { 
          ORDER: {
            gte: sourceOrder,
            lte: updateOrder
          } 
        },
        data: { ORDER: { decrement: 1 } },
      });
    } else {
      // 선순서로 이동
      await prisma.w_ROWS.updateMany({
        where: { 
          ORDER: {
            gte: updateOrder,
            lte: sourceOrder
          } 
        },
        data: { ORDER: { increment: 1 } },
      });
    }
    // 대상 업데이트
    await prisma.w_ROWS.update({
      where: { ID: rowId },
      data: { ORDER: updateOrder },
    });
    return;
  } catch (error) {
    console.error('item name 업데이트 실패:', error);
    throw new Error('item name 업데이트 실패');
  }
}

export async function addTaskToDB({itemId, name} : {itemId: number, name: string}) {
  // max order 구하기
  const maxOrder = await prisma.w_ROWS.aggregate({
    where: {
      ITEM_ID: itemId
    },
    _max: {
      ORDER: true
    }
  });

  // field 구하기
  const fields = await prisma.w_FIELDS.findMany({
    where: {
      ITEM_ID: itemId
    }
  });

  const now = new Date();
  // row 추가
  const result = await prisma.w_ROWS.create({
    data: {
      ITEM_ID: itemId,
      ORDER: (maxOrder._max.ORDER ?? -1) + 1,
      REG_DT: now
    },
  });

  // value 추가
  fields.forEach(async (f) => {
    const value = f.FIELD_TYPE === 'name' ? name : ''
    await prisma.w_VALUES.create({
      data: {
        ROW_ID: result.ID,
        FIELD_ID: f.ID,
        VALUE: value,
        REG_DT: now
      },
    });
  })
  return result;
}