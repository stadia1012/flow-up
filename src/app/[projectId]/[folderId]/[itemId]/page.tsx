import ItemTableWrapper from '@/app/component/table/itemTableWrapper'
import { getList } from '@/app/controllers/projectController'

/* params가 비동기(Promise) 객체로 전달되기 때문에 params를 먼저 await한 후에 속성 사용 */
export default async function Main({
  params // { projectId, folderId, itemId }
}: {
  params: Promise<{
    projectId: string
    folderId: string
    itemId: string
  }>
}) {
  const { projectId, folderId, itemId } = await params;
  const project = await getList({
    type: 'project',
    id: Number(projectId),
  });
  const folder = await getList({
    type: 'folder',
    id: Number(folderId),
  });
  const item = await getList({
    type: 'item',
    id: Number(itemId),
  });

  return (
    <div className='flex flex-col p-[15px] pt-[20px]'>
      <div className='pl-[15px]'>
        <div className='text-[13.5px] text-gray-500 mb-[10px] font-[400]'>
          <span className='inline-block'>{project?.name || 'Unknown'}</span>
          <span className='inline-block ml-[10px] mr-[10px]'>/</span>
          <span className='inline-block'>{folder?.name || 'Unknown'}</span>
          <span className='inline-block ml-[10px] mr-[10px]'>/</span>
          <span className='inline-block'>{item?.name || 'Unknown'}</span>
        </div>
        <h1 className='text-[15px] font-[600] '>{item?.name || 'Unknown'}</h1>
      </div>
      <ItemTableWrapper itemId={Number(itemId)} />
    </div>
  );
}