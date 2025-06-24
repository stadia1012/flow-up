// app/api/org-tree/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import type { DataNode } from 'antd/lib/tree'
const prisma = new PrismaClient();

export async function GET() {
  // 1) 모든 부서 + 소속 사용자 가져오기
  const depts = await prisma.cBT_USER_DEPT.findMany({
    where: {
      TEST_YN: "N",
      USE_YN: "Y",
    },
    include: {
      users: { // CBT_USER[]
        where: {
          TEST_YN: "N",
          USE_YN: "Y",
          DELETE_YN: "N"
        },
      }, 
    },
    orderBy: { ORDER_INDEX: "asc" }
  });

  // 2) 부서 코드 → 노드 매핑
  const nodeMap = new Map<string, DataNode>();
  depts.forEach((d) => {
    nodeMap.set(d.DEPT_CODE, {
      key: `d-${d.DEPT_CODE}`,
      title: d.DEPT_NAME ?? d.DEPT_CODE,
      children: [], // 일단 비우기
    });
  });

  // 3) 사용자 노드 추가
  depts.forEach((d) => {
    if (d.users.length > 0) {
      const parent = nodeMap.get(d.DEPT_CODE)!;
      d.users.forEach((u) => {
        parent.children!.push({
          key: `u-${u.USER_ID}`,
          title: u.USER_NAME || 'no Name',
        });
      });
    }
  });

  // 4) 부서 간 계층 연결 (DIV_CODE 기준)
  const roots: DataNode[] = [];
  depts.forEach((d) => {
    const node = nodeMap.get(d.DEPT_CODE)!;
    if (d.DIV_CODE && nodeMap.has(d.DIV_CODE)) {
      nodeMap.get(d.DIV_CODE)!.children!.push(node);
    } else {
      // 상위 부서가 없다면 최상위
      roots.push(node);
    }
  });

  return NextResponse.json(roots);
}
