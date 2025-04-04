export type TStatus = 'todo' | 'in-progress' | 'done';
export type TProject = { id: string; content: string; status: TStatus };

const projectDataKey = Symbol('troject');

export type TProjectData = { [projectDataKey]: true; projectId: TProject['id'] };

export function getProjectData(project: TProject): TProjectData {
  return { [projectDataKey]: true, projectId: project.id };
}

export function isProjectData(data: Record<string | symbol, unknown>): data is TProjectData {
  return data[projectDataKey] === true;
}

const projects: TProject[] = [
  { id: 'project-0', content: 'Organize a team-building event', status: 'todo' },
  { id: 'project-1', content: 'Create and maintain office inventory', status: 'in-progress' },
  { id: 'project-2', content: 'Update company website content', status: 'done' },
  { id: 'project-3', content: 'Plan and execute marketing campaigns', status: 'todo' },
  { id: 'project-4', content: 'Coordinate employee training sessions', status: 'done' },
  { id: 'project-5', content: 'Manage facility maintenance', status: 'done' },
  { id: 'project-6', content: 'Organize customer feedback surveys', status: 'todo' },
  { id: 'project-7', content: 'Coordinate travel arrangements', status: 'in-progress' },
];

export function getProjects() {
  return projects;
}
