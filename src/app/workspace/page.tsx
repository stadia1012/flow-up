import { redirect } from 'next/navigation';
import { getLatestItem } from '../controllers/projectController';

export default async function Main() {
  // 가장 최신 item으로 리다이렉트
  const latestItemId = await getLatestItem();

  if (latestItemId && latestItemId !== 0) {
    redirect(`/workspace/${latestItemId}`);
  }

  return <></>;
}