import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: { itemId: string } }
) {
  const { itemId } = context.params;
  const id = Number(itemId);
  
  try {
    // query
    const [rawValues, rawfields] = await Promise.all([
      // rawValues
      prisma.w_VALUES.findMany({
        where: { row: { ITEM_ID: id } },
        include: {
          row: true,
          field: true,
        },
      }),
      // rawfields
      prisma.w_FIELDS.findMany({
        where: { ITEM_ID: id },
        select: { ID: true, fieldType: true, ORDER: true, WIDTH: true }
      })
    ])
    
    const rowMap = new Map<number, TaskRow>();
    rawValues.forEach(({ row, field, VALUE }) => {
      const key = row?.ID as number;
      if (!rowMap.has(key)) {
        rowMap.set(key, {
          values: {}, // 이곳에 숫자 키로 VALUE를 쌓음
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
      typeId: f.fieldType.ID,
      order: f.ORDER || 0,
      width: f.WIDTH || 200
    }));
    const data = {
      rows: rows as TaskRow[],
      fields: fields as TaskField[]
    }

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch values" },
      { status: 500 }
    );
  }
}