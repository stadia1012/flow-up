'use server'
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
const prisma = new PrismaClient();

// 이름으로 사용자 검색
export async function searchUserByNameFromDB({
  searchKeyword,
}: {
  searchKeyword: string;
}) {
  try {
    const users = await prisma.cBT_USER.findMany({
      where: {
        USER_NAME: {
          contains: searchKeyword,
        },
        TEST_YN: 'N', // 테스트 계정 제외
        DELETE_YN: 'N', // 삭제된 계정 제외
      },
      select: {
        USER_ID: true,
        USER_NAME: true,
      },
    });
    const result = users.map(user => ({
      userId: user.USER_ID || '',
      userName: user.USER_NAME || '',
    }));
    return result;
  } catch (error) {
    console.error('사용자 검색 실패:', error);
    throw new Error('사용자 검색 실패');
  }
}

// 이름으로 사용자 또는 부서 검색
export async function searchUserOrDepartmentByNameFromDB({
  searchKeyword,
}: {
  searchKeyword: string;
}) {
  try {
    const users = await prisma.cBT_USER.findMany({
      where: {
        USER_NAME: {
          contains: searchKeyword,
        },
        TEST_YN: 'N', // 테스트 계정 제외
        DELETE_YN: 'N', // 삭제된 계정 제외
      },
      select: {
        USER_ID: true,
        USER_NAME: true,
      },
    });

    const departments = await prisma.cBT_USER_DEPT.findMany({
      where: {
        DEPT_NAME: {
          contains: searchKeyword,
        },
        TEST_YN: 'N', // 테스트 계정 제외
      },
      select: {
        DEPT_CODE: true,
        DEPT_NAME: true,
      },
    });

    return { users, departments };
  } catch (error) {
    console.error('사용자 또는 부서 검색 실패:', error);
    throw new Error('사용자 또는 부서 검색 실패');
  }
}

// 관리자 목록 조회
export async function getAdminListFromDB() {
  try {
    const adminUsers = await prisma.w_ADMIN_USERS.findMany({
      select: {
        USER_ID: true,
        IS_ACTIVE: true,
        user: {
          select: {
            USER_NAME: true,
          },
        }
      },
      orderBy: {
        REG_DT: 'asc',
      },
    });

    const data = adminUsers.map(user => ({
      userId: user.USER_ID || '',
      userName: user.user?.USER_NAME || '',
      isActive: user.IS_ACTIVE || 'Y',
    }));
    return {data};
  } catch (error) {
    console.error('관리자 목록 조회 실패:', error);
    throw new Error('관리자 목록 조회 실패');
  }
}

// 관리자 목록에 사용자 추가
export async function addUserToAdminListOnDB({
  userId,
}: {
  userId: string;
}) {
  const session = await getServerSession(authOptions);
  const checkDuplicate = await prisma.w_ADMIN_USERS.findUnique({
    where: { USER_ID: userId },
  });
  if (checkDuplicate) {
    return {result: "duplicate"}; // 중복된 사용자
  }
  try {
    await prisma.w_ADMIN_USERS.upsert({
      where: { USER_ID: userId },
      update: {},
      create: {
        USER_ID: userId,
        REG_ID: session?.user.id || 'system', // 세션에서 사용자 ID 가져오기
        REG_DT: new Date(),
      },
    });
    return {result: "success"};
  } catch (error) {
    console.error('관리자 추가 실패:', error);
    throw new Error('관리자 추가 실패');
  }
}

// 관리자 목록에서 사용자 삭제
export async function deleteUserFromAdminListOnDB({
  userIds,
}: {
  userIds: string[];
}) {
  try {
    await prisma.w_ADMIN_USERS.deleteMany({
      where: { USER_ID: { in: userIds } },
    });
    return {result: "success"};
  } catch (error) {
    console.error('관리자 삭제 실패:', error);
    throw new Error('관리자 삭제 실패');
  }
}

// 관리자 상태 업데이트
export async function updateAdminStatusOnDB({
  userId,
  isActive,
}: {
  userId: string;
  isActive: 'Y' | 'N';
}) {
  try {
    await prisma.w_ADMIN_USERS.update({
      where: { USER_ID: userId },
      data: { IS_ACTIVE: isActive },
    });
    return {result: "success"};
  } catch (error) {
    console.error('관리자 상태 업데이트 실패:', error);
    throw new Error('관리자 상태 업데이트 실패');
  }
}