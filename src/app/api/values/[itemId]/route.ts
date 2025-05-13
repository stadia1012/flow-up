import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  const { itemId } = await params;
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
        select: { ID: true, NAME: true, FIELD_TYPE: true }
      })
    ])
    
    const rowMap = new Map<number, Record<string, any>>();
    rawValues.forEach(({ row, field, VALUE }) => {
      const key = row?.ID as number;
      if (!rowMap.has(key)) rowMap.set(key, {});
      const entry = rowMap.get(key)!;
      entry['rowId'] = row?.ID;
      entry['order'] = row?.ORDER;
      entry[field?.ID as number] = VALUE;
    });

    const object = {
      values: Array.from(rowMap.values()),
      fields: rawfields.map(f => ({
        id: f.ID,
        name: f.NAME,
        type: f.FIELD_TYPE
      }))
    }

    return NextResponse.json(object);

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch values" },
      { status: 500 }
    );
  }
}