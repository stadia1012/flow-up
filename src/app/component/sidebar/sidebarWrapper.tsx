'use server'
import { getProjects } from '@/app/controllers/projectController';
import Sidebar from "@/app/component/sidebar/sidebar";

export default async function SidebarWrapper() {
  const projects = await getProjects();
  return (
    <>
      <Sidebar projects={projects} />
    </>
  );
}