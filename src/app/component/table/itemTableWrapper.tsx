'use server'
import ItemTable from '@/app/component/table/itemTable'
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth/auth";
import { redirect } from 'next/navigation'
const prisma = new PrismaClient();
export default async function ItemTableWrapper({itemId} : {itemId: number}) {
  // const res = await fetch(`http://localhost:3000/api/values/${itemId}`);
  // const data: {
  //   fields: Field[];
  //   values: Record<string, any>[];
  // } = await res.json();
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const [rawValues, rawfields] = await Promise.all([
    // rawValues
    prisma.w_VALUES.findMany({
      where: {
        row: {
          ITEM_ID: itemId,
        },
      },
      include: {
        row: {
          include: {
            children: true,
          }
        },
        field: true,
      },
    }),
    // rawfields
    prisma.w_FIELDS.findMany({
      where: {
        ITEM_ID: itemId,
        IS_HIDDEN: 'N',
        fieldType: {
          IS_DELETED: 'N'
        }
      },
      select: { ID: true, ORDER: true, WIDTH: true,
        fieldType: {
          select: {
            ID: true, NAME: true, DATA_TYPE: true, IS_PERMIT_ALL: true,
            dropdownOptions: {
              select: {
                ID: true, ORDER: true, COLOR: true, NAME: true
              }
            },
            userPermissions: {
              where: { RESOURCE_TYPE: 'field' },
              select: {
                USER_ID: true
              }
            },
            deptPermissions: {
              where: { RESOURCE_TYPE: 'field' },
              select: {
                DEPT_CODE: true
              }
            }
          }
        }
      }
    })
  ])

  /* row 계층구조 구현하기 */
  // 1단계: 모든 row 데이터를 Map으로 구성
  const rowMap = new Map<number, TaskRow>();
  rawValues.forEach(({ row, field, VALUE }) => {
    const key = row?.ID as number;
    if (!rowMap.has(key)) {
      rowMap.set(key, {
        values: {}, // 숫자 키로 VALUE 쌓기
        rowId: row?.ID as number,
        parentId: row?.PARENT_ID || null,
        level: row?.LEVEL as number,
        order: row?.ORDER as number,
        subRows: [] // 빈 배열로 초기화
      });
    }
    const entry = rowMap.get(key)!;
    entry.values[field?.ID as number] = VALUE || '';
  });

  // 2단계: 계층구조 구성 (부모-자식 관계 설정)
  const allRows = Array.from(rowMap.values());
  const topLevelRows: TaskRow[] = [];

  // 최상위 rows와 하위 rows 분리
  allRows.forEach(row => {
    if (row.parentId === null) {
      // 최상위 row
      topLevelRows.push(row);
    } else {
      // 하위 row - 부모 찾아서 subRows에 추가
      const parentRow = rowMap.get(row.parentId);
      if (parentRow) {
        parentRow.subRows!.push(row);
      }
    }
  });

  // 3단계: 각 레벨별로 정렬
  const sortRowsRecursively = (rows: TaskRow[]) => {
    rows.sort((a, b) => a.order - b.order);
    rows.forEach(row => {
      if (row.subRows && row.subRows.length > 0) {
        sortRowsRecursively(row.subRows);
      }
    });
  };
  sortRowsRecursively(topLevelRows);

  const fields: TaskField[] = rawfields.map(f => ({
    fieldId: f.ID,
    name: f.fieldType.NAME || '',
    typeId: f.fieldType.ID || 0,
    type: f.fieldType.DATA_TYPE || '',
    order: f.ORDER || 0,
    width: f.WIDTH || 200,
    dropdownOptions: f.fieldType.dropdownOptions.map((opt) => {
      return {
        id: opt.ID.toString(),
        order: opt.ORDER || 0,
        color: opt.COLOR || '',
        name: opt.NAME || ''
      }
    }),
    canEdit: (
      // 관리자 검사
      session?.user.isAdmin === true
      // 전체 허용 검사
      || f.fieldType.IS_PERMIT_ALL === 'Y'
      // 사용자 권한 검사
      || session?.user?.id && f.fieldType.userPermissions
        .some(perm => perm.USER_ID === session.user.id))
      // 소속부서 권한 검사
      || ((session?.user.ancestorDepts || []).length > 0 && f.fieldType.deptPermissions
        .some(perm => session?.user.ancestorDepts?.includes(perm.DEPT_CODE))
    )
  }));
  const data = {
    rows: topLevelRows as TaskRow[],
    fields: fields as TaskField[]
  }
  return (
    <div className='h-full w-full relative overflow-hidden'>
      <ItemTable initialTableData={data} itemId={itemId} />
    </div>
  );
}