'use client'
import { useState, useEffect, useRef } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import Folder from "./folder";
import { DropIndicator } from "./drop-indicator";

type DragState =
  | { type: "idle" }
  | { type: "dragging-over"; closestEdge: ReturnType<typeof extractClosestEdge> };

export default function DraggableFolder({ folder }: { folder: List }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState>({ type: "idle" });

  useEffect(() => {
    console.log('draggableFolder dnd');
    const element = ref.current;
    if (!element) return;

    // combine를 사용해 draggable과 dropTargetForElements를 한 번에 등록
    return combine(
      // 드래그 가능하도록 등록
      draggable({
        element: element,
        getInitialData() {
          return { true: true, folderId: folder.id };
        },
      }),
      // 개별 항목에 dropTarget 등록 (시각적 피드백)
      dropTargetForElements({
        element,
        canDrop({ source }) {
          // 자신에게 드롭되지 않도록 처리
          if (source.element === element) return false;
          return source.data && "folderId" in source.data;
        },
        getData({ input }) {
          // attachClosestEdge를 이용해 현재 요소의 가장 가까운 엣지 정보를 포함한 데이터를 반환
          return attachClosestEdge({ folderId: folder.id }, { element, input, allowedEdges: ["top", "bottom"] });
        },
        getIsSticky() {
          return true;
        },
        onDragEnter({ self }) {
          const closestEdge = extractClosestEdge(self.data);
          setDragState({ type: "dragging-over", closestEdge });
        },
        onDrag({ self }) {
          const closestEdge = extractClosestEdge(self.data);
          setDragState({ type: "dragging-over", closestEdge });
        },
        onDragLeave() {
          setDragState({ type: "idle" });
        },
        onDrop() {
          setDragState({ type: "idle" });
        },
      })
    );
  }, [folder]);

  return (
    <div ref={ref} data-folder-id={folder.id}
    className="cursor-grab relative">
      {/* 드래그 인디케이터 */}
      {dragState.type === "dragging-over" && dragState.closestEdge && (
        <DropIndicator edge={dragState.closestEdge} gap="0px" />
      )}
      <Folder folder={folder} />
    </div>
  );
}
