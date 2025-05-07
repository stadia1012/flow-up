'use server'
import ItemTable from '@/app/component/itemTable'
export default async function ItemTableWrapper({itemId} : {itemId: number}) {
  const res = await fetch(`http://localhost:3000/api/values/${itemId}`);
  const data: {
    fields: { id: number; name: string }[];
    values: Record<string, any>[];
  } = await res.json();
  return (
    <>
      <ItemTable fields={data.fields} values={data.values} />
    </>
  );
}