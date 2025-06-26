'use server'
import { getProjects } from '@/app/controllers/projectController';
import Sidebar from "@/app/component/sidebar/sidebar";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function SidebarWrapper() {
  const projects = await getProjects();
  const session = await getServerSession(authOptions);
  return (
    <>
      <Sidebar projects={projects} session={session} />
    </>
  );
}