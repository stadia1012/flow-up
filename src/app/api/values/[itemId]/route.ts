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
    const [rawValues, fields] = await Promise.all([
      prisma.w_VALUES.findMany({
        where: { row: { ITEM_ID: id } },
        include: {
          row: true,
          field: true,
        },
      }),
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

      entry[field?.ID as number] = VALUE;
    });

    const object = {
      values: Array.from(rowMap.values()),
      fields: fields
    }

    return NextResponse.json(object);

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch values" },
      { status: 500 }
    );
  }
}