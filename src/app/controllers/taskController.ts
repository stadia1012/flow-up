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

// task (row) 추가
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
    include: { fieldType: true },
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
    const value = f.fieldType.DATA_TYPE === 'name' ? name : ''
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

// value 수정
export async function updateValueToDB({
  rowId, fieldId, value
}: {
  rowId: number, fieldId: number, value: string
}) {
  await prisma.w_VALUES.updateMany({
    where: {
      ROW_ID: rowId,
      FIELD_ID: fieldId
    },
    data: { VALUE: value },
  });
}

// field 중복 검사
export async function checkDuplicateFields({
  name, type
}: {
  name: string, type: string
}) {
  const result = await prisma.w_FIELD_TYPES.findMany({
    where: {
      NAME: name,
      DATA_TYPE: type
    },
  });

  return {
    isDuplicate: (0 < result.length),
    result
  };
}

// field 추가
export async function addFieldToDB({
  itemId, name, type
}: {
  itemId: number, name: string, type: string
}) {
  const now = new Date();
  // field type 추가
  const fieldType = await prisma.w_FIELD_TYPES.create({
    data: {
      NAME: name,
      DATA_TYPE: type,
      REG_DT: now
    },
  });

  // field maxOrder 조회
  const maxOrder = await prisma.w_FIELDS.aggregate({
    where: {
      ITEM_ID: itemId
    },
    _max: {
      ORDER: true
    }
  });

  // field 추가
  const newField = await prisma.w_FIELDS.create({
    data: {
      ITEM_ID: itemId,
      FIELD_TYPE_ID: fieldType.ID,
      ORDER: (maxOrder._max.ORDER ?? -1) + 1,
      WIDTH: 200,
      REG_DT: now
    },
  });

  // row 조회
  const rows = await prisma.w_ROWS.findMany({
    where: {
      ITEM_ID: itemId,
    },
  });
  
  // row별 value 추가
  const newValues: {rowId: number, valueId: number}[] = [];
  rows.forEach(async (row) => {
    const newData = await prisma.w_VALUES.create({
      data: {
        ROW_ID: row.ID,
        FIELD_ID: newField.ID,
        VALUE: '',
        REG_DT: now
      },
    });
    newValues.push({ rowId: row.ID, valueId: newData.ID })
  });
  return {values: newValues, fields: newField};
}

/* dropdown field 추가 */
export const addDropdownFieldToDB = async ({
  options, itemId, name, type
}:{
  options: DropdownOption[], itemId: number, name: string, type: string
}) => {
  if (type !== "dropdown") {
    throw new Error;
  }
  const now = new Date();

  // field type 추가
  const fieldType = await prisma.w_FIELD_TYPES.create({
    data: {
      NAME: name,
      DATA_TYPE: type,
      REG_DT: now
    },
  });

  // dropdown options 추가
  options.forEach(async (option, idx) => {
    await prisma.w_DROPDOWN_OPTIONS.create({
      data: {
        FIELD_TYPE_ID: fieldType.ID,
        ORDER: idx,
        COLOR: option.color,
        NAME: option.name,
        REG_DT: now
      },
    });
  });

  // field maxOrder 조회
  const maxOrder = await prisma.w_FIELDS.aggregate({
    where: {
      ITEM_ID: itemId
    },
    _max: {
      ORDER: true
    }
  });

  // field 추가
  const newField = await prisma.w_FIELDS.create({
    data: {
      ITEM_ID: itemId,
      FIELD_TYPE_ID: fieldType.ID,
      ORDER: (maxOrder._max.ORDER ?? -1) + 1,
      WIDTH: 200,
      REG_DT: now
    },
  });

  // row 조회
  const rows = await prisma.w_ROWS.findMany({
    where: {
      ITEM_ID: itemId,
    },
  });
  
  // row별 value 추가
  const newValues: {rowId: number, valueId: number}[] = [];
  rows.forEach(async (row) => {
    const newData = await prisma.w_VALUES.create({
      data: {
        ROW_ID: row.ID,
        FIELD_ID: newField.ID,
        VALUE: '',
        REG_DT: now
      },
    });
    newValues.push({ rowId: row.ID, valueId: newData.ID })
  });
  return {values: newValues, fields: newField};
}

// field width 변경
export async function updateFieldWidth({
  fieldId, width
}: {
  fieldId: number, width: number
}) {
  await prisma.w_FIELDS.update({
    where: {
      ID: fieldId,
    },
    data: {
      WIDTH: width
    }
  });
}