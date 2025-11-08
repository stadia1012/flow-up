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

    let updateOrder_ = updateOrder;

    if (updateOrder === -1) {
      const maxOrder = await model.aggregate({
        where: {
          PARENT_ID: updateParentId,
        },
        _max: {
          ORDER: true
        }
      })
      updateOrder_ = (maxOrder._max.ORDER ?? -1) + 1;
    }

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
        ORDER: { gte: updateOrder_ },
        ...(type !== "project" && { PARENT_ID: updateParentId })
      },
      data: { ORDER: { increment: 1 } },
    });

    // 대상의 parentId, order 변경
    const data: Record<string, any> = {
      ORDER: updateOrder_,
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
          FIELD_TYPE_ID: 1,  // 1: 'name' type
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

// delete item
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

// 아이템 복사 (copy)
export async function copyItemFromDB({
  originalItemId,
  folderId,
  newName,
  copyOption,
}: {
  originalItemId: number,
  folderId: number,
  newName: string
  copyOption: string,
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 원본 ITEM 조회
      const originalItem = await tx.w_ITEMS.findUnique({
        where: { ID: originalItemId },
        include: {
          // 관련된 FIELDS와 ROWS도 함께 조회
          fields: {
            include: {
              values: true,
              fieldType: true
            }
          },
          rows: {
            include: {
              values: {
                include: {
                  field: {
                    include: {
                      fieldType: true  // VALUE의 FIELD_TYPE 포함
                    }
                  }
                }
              },
              tags: true // ROW의 TAGS 정보 포함
            },
            where: {
              IS_DELETED: 'N'
            }
          }
        }
      });

      if (!originalItem) {
        throw new Error(`Item with ID ${originalItemId} not found`);
      }

      // 2. 새로운 ITEM 생성
      const newItem = await tx.w_ITEMS.create({
        data: {
          PARENT_ID: folderId,
          NAME: newName,
          ICON_COLOR: originalItem.ICON_COLOR,
          ORDER: originalItem.ORDER,
          IS_DELETED: "N",
          ROWS_VERSION: originalItem.ROWS_VERSION,
          FIELDS_VERSION: originalItem.FIELDS_VERSION,
          //REG_ID: userId || originalItem.REG_ID,
          REG_DT: new Date(),
          //UPDT_ID: userId || originalItem.UPDT_ID,
          UPDT_DT: new Date()
        }
      });

      // 3. FIELDS 복사
      const fieldMap = new Map<number, number>(); // 원본 FIELD_ID -> 새 FIELD_ID 매핑
      
      for (const originalField of originalItem.fields) {
        const newField = await tx.w_FIELDS.create({
          data: {
            ITEM_ID: newItem.ID,
            FIELD_TYPE_ID: originalField.FIELD_TYPE_ID,
            ORDER: originalField.ORDER,
            WIDTH: originalField.WIDTH,
            IS_HIDDEN: originalField.IS_HIDDEN,
            //REG_ID: userId || originalField.REG_ID,
            REG_DT: new Date(),
            //UPDT_ID: userId || originalField.UPDT_ID,
            UPDT_DT: new Date()
          }
        });
        
        fieldMap.set(originalField.ID, newField.ID);
      }

      // 4. ROWS와 VALUES, TAGS 복사
      const rowMap = new Map<number, number>();
      // 낮은 level이 먼저 처리되도록
      const sortedRows = originalItem.rows.sort((a, b) => (a.LEVEL || 0) - (b.LEVEL || 0));
      for (const originalRow of sortedRows) {
        const newRow = await tx.w_ROWS.create({
          data: {
            ITEM_ID: newItem.ID,
            PARENT_ID: originalRow.PARENT_ID ? rowMap.get(originalRow.PARENT_ID) || null : null,
            LEVEL: originalRow.LEVEL,
            ORDER: originalRow.ORDER,
            IS_DELETED: originalRow.IS_DELETED,
            //REG_ID: userId || originalRow.REG_ID,
            REG_DT: new Date(),
            //UPDT_ID: userId || originalRow.UPDT_ID,
            UPDT_DT: new Date()
          }
        });
        rowMap.set(originalRow.ID, newRow.ID);

        if (copyOption === 'withData') {
          // 해당 ROW의 VALUES 복사
          for (const originalValue of originalRow.values) {
            if (originalValue.FIELD_ID && fieldMap.has(originalValue.FIELD_ID)) {
              await tx.w_VALUES.create({
                data: {
                  ROW_ID: newRow.ID,
                  FIELD_ID: fieldMap.get(originalValue.FIELD_ID)!,
                  VALUE: originalValue.VALUE,
                  //REG_ID: userId || originalValue.REG_ID,
                  REG_DT: new Date(),
                  //UPDT_ID: userId || originalValue.UPDT_ID,
                  UPDT_DT: new Date()
                }
              });
            }
          }
        } else if (copyOption === 'noData') {
          // FIELD_TYPE_ID가 1인 VALUES만 복사
          for (const originalValue of originalRow.values) {
            if (originalValue.FIELD_ID && 
                fieldMap.has(originalValue.FIELD_ID) &&
                originalValue.field?.fieldType?.ID === 1) {
              await tx.w_VALUES.create({
                data: {
                  ROW_ID: newRow.ID,
                  FIELD_ID: fieldMap.get(originalValue.FIELD_ID)!,
                  VALUE: originalValue.VALUE,
                  //REG_ID: userId || originalValue.REG_ID,
                  REG_DT: new Date(),
                  //UPDT_ID: userId || originalValue.UPDT_ID,
                  UPDT_DT: new Date()
                }
              });
            }
          }
        }
        // ROW_TAGS 복사 (copyOption과 관계없이 항상 복사)
        for (const originalTag of originalRow.tags) {
          await tx.w_ROW_TAGS.create({
            data: {
              ROW_ID: newRow.ID,
              TAG_ID: originalTag.TAG_ID
            }
          });
        }
      }
      return newItem;
    });

    return {
      success: true,
      newItem: result,
      message: '아이템이 성공적으로 복사되었습니다.'
    };

  } catch (error) {
    console.error('Error copying W_ITEM:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    };
  }
}

// 가장 최신 item 가져오기
export async function getLatestItem() {
  try {
    const latestId = await prisma.w_ITEMS.aggregate({
      _max: {
        ID: true
      }
    });
    return latestId._max.ID || 0;
  } catch (error) {
    console.error('item 조회 실패:', error);
    throw new Error('item 조회 실패');
  }
}