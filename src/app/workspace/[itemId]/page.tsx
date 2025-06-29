import ItemTableWrapper from '@/app/component/table/itemTableWrapper'
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";

/* params가 비동기(Promise) 객체로 전달되기 때문에 params를 먼저 await한 후에 속성 사용 */
export default async function Main({
  params
}: {
  params: Promise<{
    itemId: string
  }>
}) {
  const { itemId } = await params;
  return (
    <ItemTableWrapper itemId={Number(itemId)} />
  );
}