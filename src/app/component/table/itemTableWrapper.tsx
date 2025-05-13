'use server'
import ItemTable from '@/app/component/table/itemTable'
export default async function ItemTableWrapper({itemId} : {itemId: number}) {
  const res = await fetch(`http://localhost:3000/api/values/${itemId}`);
  const data: {
    fields: Field[];
    values: Record<string, any>[];
  } = await res.json();
  return (
    <>
      <ItemTable fields={data.fields} initialData={data.values} itemId={itemId} />
    </>
  );
}