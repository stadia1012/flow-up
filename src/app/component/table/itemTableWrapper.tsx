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
      where: { row: { ITEM_ID: itemId } },
      include: {
        row: true,
        field: true,
      },
    }),
    // rawfields
    prisma.w_FIELDS.findMany({
      where: { ITEM_ID: itemId, IS_HIDDEN: 'N' },
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

  const rowMap = new Map<number, TaskRow>();
  rawValues.forEach(({ row, field, VALUE }) => {
    const key = row?.ID as number;
    if (!rowMap.has(key)) {
      rowMap.set(key, {
        values: {},           // 숫자 키로 VALUE 쌓기
        rowId: row?.ID as number,
        order: row?.ORDER as number,
      });
    }
    const entry = rowMap.get(key)!;
    entry.values[field?.ID as number] = VALUE || '';
  });

  const rows = Array.from(rowMap.values());
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
      // 소속부서 권한 검시
      || ((session?.user.ancestorDepts || []).length > 0 && f.fieldType.deptPermissions
        .some(perm => session?.user.ancestorDepts?.includes(perm.DEPT_CODE))
    )
  }));
  const data = {
    rows: rows as TaskRow[],
    fields: fields as TaskField[]
  }
  return (
    <>
      <ItemTable initialTableData={data} itemId={itemId} />
    </>
  );
}