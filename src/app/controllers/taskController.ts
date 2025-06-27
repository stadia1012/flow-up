'use server'
import { TaskFieldType } from '@/global';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth/auth";
const prisma = new PrismaClient();

type PrismaModel = {
  update: (args: any) => Promise<any>,
  updateMany: (args: any) => Promise<any>,
  create: (args: any) => Promise<any>,
  delete: (args: any) => Promise<any>,
  aggregate: (args: any) => Promise<any>,
  findUnique: (args: any) => Promise<any>,
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
      // 후순서로 이동하는 경우
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
      // 선순서로 이동하는 경우
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
    console.error('row order 업데이트 실패:', error);
    throw new Error('row order 업데이트 실패');
  }
}

// task (row) 추가
export async function addTaskRowToDB(
  {
    itemId,
    fieldId,
    name
  }:
  {
    itemId: number,
    fieldId: number,
    name: string
  }) {
  // max order 구하기
  const maxOrder = await prisma.w_ROWS.aggregate({
    where: {
      ITEM_ID: itemId
    },
    _max: {
      ORDER: true
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

  // name 값 입력
  await prisma.w_VALUES.create({
    data: {
      ROW_ID: result.ID,
      FIELD_ID: fieldId,
      VALUE: name,
      REG_DT: now
    },
  });

  return result;
}

// value 수정 (upsert)
export async function updateValueToDB({
  rowId, fieldId, value
}: {
  rowId: number, fieldId: number, value: string
}) {
  await prisma.w_VALUES.upsert({
    where: {
      unique_row_field: {
        ROW_ID: rowId,
        FIELD_ID: fieldId
      }
    },
    update: {
      VALUE: value,
      UPDT_DT: new Date()
    },
    create: {
      ROW_ID: rowId,
      FIELD_ID: fieldId,
      VALUE: value,
      REG_DT: new Date()
    }
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

// field type 추가
export async function addFieldTypeToDB({
  itemId, name, type, isPermitAll
}: {
  itemId: number,
  name: string,
  type: string,
  isPermitAll?: boolean
}) {
  const now = new Date();
  // field type 추가
  const fieldType = await prisma.w_FIELD_TYPES.create({
    data: {
      NAME: name,
      DATA_TYPE: type,
      REG_DT: now,
      IS_PERMIT_ALL: (isPermitAll) ? 'Y' : 'N'
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
  return {field: newField};
}

/* dropdown field type 추가 */
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


  const newOptions: {[key: string]: number } = {}; // [tempId]: realId
  // dropdown option 추가
  const promises = options.map(async (option) => {
    const res = await prisma.w_DROPDOWN_OPTIONS.create({
      data: {
        FIELD_TYPE_ID: fieldType.ID,
        ORDER: option.order,
        COLOR: option.color,
        NAME: option.name,
        REG_DT: now,
      },
    });
    newOptions[option.id] = res.ID;
  });
  await Promise.all(promises);

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

  return {fields: newField, options: newOptions};
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

// item에서 field 숨기기
export async function deleteItemFieldFromDB({
  fieldId
}: {
  fieldId: number,
}) {
  // field 숨기기
  await prisma.w_FIELDS.update({
    where: {
      ID: fieldId,
    },
    data: {
      IS_HIDDEN: 'Y'
    }
  });
}

// field 수정
export async function updateFieldTypeFromDB({
  fieldTypeId,
  name,
  dropdownOptions
}: {
  fieldTypeId: number,
  name: string,
  dropdownOptions?: DropdownOption[]
}) {
  const now = new Date();
  // name 업데이트
  await prisma.w_FIELD_TYPES.update({
    where: { ID: fieldTypeId },
    data: {
      NAME: name,
      UPDT_ID: 'USER_ID',
      UPDT_DT: now,
      // 옵션이 넘어왔을 때만 버전 올리기
      ...(dropdownOptions && { OPTIONS_VERSION: { increment: 1 } }),
    },
  });
  
  // dropdownOprions가 있는 경우 update
  if (dropdownOptions) {
    // 1) 기존 option ID 목록
    const existingOptions = await prisma.w_DROPDOWN_OPTIONS.findMany({
      where: { FIELD_TYPE_ID: fieldTypeId },
      select: { ID: true },
    });
    const existingIds = existingOptions.map(o => o.ID);

    // 2) toUpdate, toCreate, toDelete 계산
    // update: {DB: O && state: O}
    const toUpdate = dropdownOptions
      .filter(o => existingIds.includes(Number(o.id)))
      .map(o => ({
        id: Number(o.id),
        data: {
          ORDER: o.order,
          COLOR: o.color,
          NAME:  o.name,
          UPDT_ID: 'USER_ID',
          UPDT_DT: now,
        },
    }));

    // create: {DB: X && state: O}
    const toCreate = dropdownOptions
      .filter(o => !existingIds.includes(Number(o.id)))
      .map(o => ({
        ID: o.id, // temp id
        FIELD_TYPE_ID: fieldTypeId,
        ORDER:       o.order,
        COLOR:       o.color,
        NAME:        o.name,
        REG_ID:      'USER_ID',
        REG_DT:      now,
    }));

    // delete: {DB: O && state: X}
    const clientIds = dropdownOptions.map(o => Number(o.id));
    const toDeleteIds = existingIds.filter(id => !clientIds.includes(id));

    // 4) transaction으로 한 번에 처리
    await prisma.$transaction([
      // 삭제
      prisma.w_DROPDOWN_OPTIONS.deleteMany({
        where: { ID: { in: toDeleteIds } },
      }),

      // 업데이트
      ...toUpdate.map(({ id, data }) =>
        prisma.w_DROPDOWN_OPTIONS.update({
          where: { ID: id },
          data,
        })
      ),
    ]);

    // 생성 - createMany는 결과가 여러개인 경우 count만 return되어 create 사용
    const newOptions: {[key: string]: number } = {}; // [tempId]: realId
    const promises = toCreate.map(async (data) => {
      const res = await prisma.w_DROPDOWN_OPTIONS.create({
        data: {
          FIELD_TYPE_ID: data.FIELD_TYPE_ID,
          ORDER: data.ORDER,
          COLOR: data.COLOR,
          NAME: data.NAME,
          REG_ID: data.REG_ID,
          REG_DT: data.REG_DT,
        },
      });
      newOptions[data.ID] = res.ID;
    });

    await Promise.all(promises);
    return newOptions;
  }
}

// 전체 fieldType List
export async function getAllFieldTypes() {
  const fieldTypesRecord = await prisma.w_FIELD_TYPES.findMany({
    select: {
      ID: true, NAME: true, DATA_TYPE: true,
      dropdownOptions: {
        select: {
          ID: true, ORDER: true, COLOR: true, NAME: true
        }
      }
    }
  });
  const fieldTypes: TaskFieldType[] = fieldTypesRecord.map((fieldType) => {
    return {
      fieldTypeId: fieldType.ID || 0,
      name: fieldType.NAME || '',
      type: fieldType.DATA_TYPE as TaskFieldType['type'] || 'text',
      dropdownOptions: fieldType.dropdownOptions.map((opt) => {
        return {
          id: opt.ID.toString(),
          order: opt.ORDER || 0,
          color: opt.COLOR || '',
          name: opt.NAME || ''
        }
      })
    }
  })
  return fieldTypes;
}

// 특정 item fieldType List
export async function getFieldTypes({itemId}: {itemId: number}) {
  const fieldTypesRecord = await prisma.w_FIELDS.findMany({
    where: {
      ITEM_ID: itemId,
      IS_HIDDEN: 'N'
    },
    select: {
      FIELD_TYPE_ID: true,
      ORDER: true
    },
    orderBy: {
      ORDER: 'asc'
    }
  });
  const fieldTypes: {id: number, order: number}[] = fieldTypesRecord
    .map(f => {
      return {id: f.FIELD_TYPE_ID, order: f.ORDER || 0}
    });
  return fieldTypes;
}

// 필드 숨기고 표시하기 - 해당 item에 없는 경우 추가
export async function hadleFieldHiddenFromDB(
  {
    fieldTypeId,
    itemId,
    isHidden
  }:
  {
    fieldTypeId: number,
    itemId: number,
    isHidden: boolean
  }
) {
  if (isHidden) {
    // 숨기기
    await prisma.w_FIELDS.updateMany({
      where: {
        ITEM_ID: itemId,
        FIELD_TYPE_ID: fieldTypeId
      },
      data: {
        IS_HIDDEN: 'Y'
      }
    });
  } else {
    // max order
    const maxOrder = await prisma.w_FIELDS.aggregate({
      where: {
        ITEM_ID: itemId
      },
      _max: {
        ORDER: true
      }
    });

    // 필드추가 및 결과 return (temp id => real id로 redux store 업데이트)
    const field = await prisma.w_FIELDS.upsert({
      where: {
        unique_item_fieldType: {
          ITEM_ID: itemId,
          FIELD_TYPE_ID: fieldTypeId,
        },
      },
      update: {
        IS_HIDDEN: 'N',
        ORDER: (maxOrder._max.ORDER ?? -1) + 1,
      },
      create: {
        ITEM_ID: itemId,
        FIELD_TYPE_ID: fieldTypeId,
        ORDER: (maxOrder._max.ORDER ?? -1) + 1,
        WIDTH: 200,
        REG_DT: new Date(),
      },
    });

    // 권한 목록 return
    const permissions = await prisma.w_FIELD_TYPES.findUnique({
      where: {
        ID: fieldTypeId,
      },
      select: {
        IS_PERMIT_ALL: true,
        userPermissions: {
          where: {
            RESOURCE_TYPE: 'field'
          },
          select: {
            USER_ID: true
          }
        },
        deptPermissions: {
          where: {
            RESOURCE_TYPE: 'field'
          },
          select: {
            DEPT_CODE: true
          }
        }
      }
    });
    return {field, permissions};
  }
}

// row order 변경
export async function moveTaskField({
  fieldId,
  sourceOrder,
  updateOrder,
}: {
  fieldId: number;
  sourceOrder: number;
  updateOrder: number;
}) {
  try {
    if (updateOrder > sourceOrder) {
      // 후순서로 이동하는 경우
      await prisma.w_FIELDS.updateMany({
        where: { 
          ORDER: {
            gte: sourceOrder,
            lte: updateOrder
          }
        },
        data: { ORDER: { decrement: 1 } },
      });
    } else {
      // 선순서로 이동하는 경우
      await prisma.w_FIELDS.updateMany({
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
    await prisma.w_FIELDS.update({
      where: { ID: fieldId },
      data: { ORDER: updateOrder },
    });
    return;
  } catch (error) {
    console.error('field order 업데이트 실패:', error);
    throw new Error('field order 업데이트 실패');
  }
}

// delete Row
export async function deleteTaskRowFromDB({
  deleteIds
}: {
  deleteIds: number[],
}) {
  // field 숨기기
  await prisma.w_ROWS.deleteMany({
    where: {
      ID: {
        in: deleteIds
      } 
    }
  });
}

// 권한 목록(사용자) 가져오기
export async function getPemissionsFromDB(
  {type, id}: {
    type: 'field' | 'project',
    id: number
  }) {
  const userRaw = await prisma.w_USER_PERMISSIONS.findMany({
    select: {
      USER_ID: true,
      user: {
        select: {
          USER_NAME: true,
        }
      }
    },
    where: {
      RESOURCE_ID: id,
      RESOURCE_TYPE: type
    }
  });
  const users = userRaw.map(row => ({
      type: 'user',
      id: row.USER_ID,
      title: row.user.USER_NAME || ''
    })
  );

  const departmentRaw = await prisma.w_DEPT_PERMISSIONS.findMany({
    select: {
      DEPT_CODE: true,
      dept: {
        select: {
          DEPT_NAME: true,
        }
      }
    },
    where: {
      RESOURCE_ID: id,
      RESOURCE_TYPE: type
    }
  });

  const departments = departmentRaw.map(row => {
    return {
      type: 'department',
      id: row.DEPT_CODE,
      title: row.dept.DEPT_NAME || ''
    }
  });

  return {users, departments}
}

// 권한 목록 추가 (사용자 || 부서)
export async function savePermissionToDB(
  {
    resourceType,
    resourceId,
    permissions,
  }: {
    resourceType: 'field' | 'project',
    resourceId: number,
    permissions: {
      type: 'user' | 'department', id: string, title: string
    }[]
  }) : Promise<{ result: 'success' | 'error', message?: string, details?: any[] }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { result: 'error', message: 'No valid session found' };
    }

    // 트랜잭션으로 처리
    await prisma.$transaction(async (tx) => {
      // 1. 기존 권한 모두 삭제
      await tx.w_DEPT_PERMISSIONS.deleteMany({
        where: {
          RESOURCE_ID: resourceId,
          RESOURCE_TYPE: resourceType,
        }
      });

      await tx.w_USER_PERMISSIONS.deleteMany({
        where: {
          RESOURCE_ID: resourceId,
          RESOURCE_TYPE: resourceType,
        }
      });

      // 2. 새로운 권한 추가
      for (const p of permissions) {
        if (p.type === 'department') {
          await tx.w_DEPT_PERMISSIONS.create({
            data: {
              DEPT_CODE: p.id,
              RESOURCE_ID: resourceId,
              RESOURCE_TYPE: resourceType,
              REG_ID: session.user.id,
              REG_DT: new Date()
            }
          });
        } else if (p.type === 'user') {
          await tx.w_USER_PERMISSIONS.create({
            data: {
              USER_ID: p.id,
              RESOURCE_ID: resourceId,
              RESOURCE_TYPE: resourceType,
              REG_ID: session.user.id,
              REG_DT: new Date()
            }
          });
        }
      }
    });

    return { result: 'success' };

  } catch (error) {
    console.error('Error in savePermissionToDB:', error);
    return { 
      result: 'error', 
      message: 'Failed to save permissions',
      details: [error]
    };
  }
}

// isPermitAll updete
export async function updatePermitAllToDB({
  status,
  fieldTypeId
}: {
  status: boolean,
  fieldTypeId: number
}) {
  await prisma.w_FIELD_TYPES.update({
    where: {
      ID: fieldTypeId
    },
    data: {
      IS_PERMIT_ALL: (status ? 'Y' : 'N')
    }
  });
}

// get isPermitAll
export async function getPermitAllFromDB({
  fieldTypeId
}: {
  fieldTypeId: number
}) {
  const result = await prisma.w_FIELD_TYPES.findUnique({
    select: {
      IS_PERMIT_ALL: true
    },
    where: {
      ID: fieldTypeId
    },
  });
  return (result?.IS_PERMIT_ALL === 'Y') ?  true : false;
}