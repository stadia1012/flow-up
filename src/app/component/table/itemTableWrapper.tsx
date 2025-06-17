'use server'
import ItemTable from '@/app/component/table/itemTable'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default async function ItemTableWrapper({item} : {item: List}) {
  // const res = await fetch(`http://localhost:3000/api/values/${itemId}`);
  // const data: {
  //   fields: Field[];
  //   values: Record<string, any>[];
  // } = await res.json();

  const [rawValues, rawfields] = await Promise.all([
    // rawValues
    prisma.w_VALUES.findMany({
      where: { row: { ITEM_ID: item.id } },
      include: {
        row: true,
        field: true,
      },
    }),
    // rawfields
    prisma.w_FIELDS.findMany({
      where: { ITEM_ID: item.id, IS_HIDDEN: 'N' },
      select: { ID: true, ORDER: true, WIDTH: true, fieldType: {
        select: {
          ID: true, NAME: true, DATA_TYPE: true,
          dropdownOptions: {
            select: {
              ID: true, ORDER: true, COLOR: true, NAME: true
            }
          }
        }
      }}
    })
  ])

  const rowMap = new Map<number, TaskRow>();
  rawValues.forEach(({ row, field, VALUE }) => {
    const key = row?.ID as number;
    if (!rowMap.has(key)) {
      rowMap.set(key, {
        values: {},           // 이곳에 숫자 키로 VALUE를 쌓기
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
    })
  
  }));
  const data = {
    rows: rows as TaskRow[],
    fields: fields as TaskField[]
  }
  return (
    <>
      <ItemTable initialTableData={data} item={item  as List} />
    </>
  );
}