// app/api/org-tree/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  const userAncestorDeptCodes: string[] = [];
  if (session?.user?.deptCode) {
    const userDeptHierarchy = await prisma.cBT_DEPT_CLOSURE.findMany({
      where: {
        descendant: { DEPT_CODE: session.user.deptCode }
      },
      select: {
        ancestror: {
          select: { DEPT_CODE: true }
        }
      }
    });
    userAncestorDeptCodes.push(...userDeptHierarchy.map(h => h.ancestror.DEPT_CODE));
  }

  const field = await prisma.w_FIELDS.findMany({
    where: { ITEM_ID: 20, IS_HIDDEN: 'N' },
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
  const names = field.map(f => {
    return {
      id: f.fieldType.ID,
      name: f.fieldType.NAME
    }
  })

  const users = field.map(f => {
    return f.fieldType.userPermissions.map(u => ({
      field: f.ID || 'd',
      user: u.USER_ID
    }))
  })

  const depts = field.map(f => {
    return f.fieldType.deptPermissions.map(d => d.DEPT_CODE)
  })
  return NextResponse.json({
    names,
    id: session?.user.id,
    dc: session?.user.deptCode,
    users,
    depts
  });
}
