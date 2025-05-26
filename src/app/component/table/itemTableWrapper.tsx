'use server'
import ItemTable from '@/app/component/table/itemTable'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default async function ItemTableWrapper({itemId} : {itemId: number}) {
  // const res = await fetch(`http://localhost:3000/api/values/${itemId}`);
  // const data: {
  //   fields: Field[];
  //   values: Record<string, any>[];
  // } = await res.json();

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
      where: { ITEM_ID: itemId },
      select: { ID: true, fieldType: true, ORDER: true, WIDTH: true }
    })
  ])

  const rowMap = new Map<number, TaskRow>();
  rawValues.forEach(({ row, field, VALUE }) => {
    const key = row?.ID as number;
    if (!rowMap.has(key)) {
      rowMap.set(key, {
        values: {},           // 이곳에 숫자 키로 VALUE를 쌓을 것
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
    type: f.fieldType.DATA_TYPE || '',
    order: f.ORDER || 0,
    width: f.WIDTH || 200
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