'use client'
import { useState, useEffect, useRef } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import Folder from "./folder";
import { DropIndicator } from "./drop-indicator";

type DragState =
  | { type: "idle" }
  | { type: "dragging-over"; closestEdge: ReturnType<typeof extractClosestEdge> }
  | { type: "dragging-folder-over"; };

export default function DraggableFolder({ folder }: { folder: List }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState>({ type: "idle" });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return combine(
      // 드래그 가능하도록 등록
      draggable({
        element: element,
        getInitialData() {
          return { folderId: folder.id, parentId: folder.parentId, folder: folder }; // 드래그 시 전달 데이터
        },
      }),
      // 개별 항목에 dropTarget 등록 (시각적 피드백)
      dropTargetForElements({
        element,
        canDrop({ source }) {
          if (source.element === element) return false; // 자신에게 드롭 방지
          return source.data && ("folderId" in source.data || "itemId" in source.data);
        },
        getData({ input }) {
          return attachClosestEdge(
              { folderId: folder.id, parentId: folder.parentId, folder: folder },
              { element, input, allowedEdges: ["top", "bottom"] }
            )
        },
        getIsSticky() {
          return true;
        },
        onDragEnter({ self, source }) {
          if ("folderId" in source.data) {
            const closestEdge = extractClosestEdge(self.data);
            setDragState({ type: "dragging-over", closestEdge });
          } else if ("itemId" in source.data) {
            setDragState({ type: "dragging-folder-over" });
          }
        },
        onDrag({ self, source }) {
          if ("folderId" in source.data) {
            const closestEdge = extractClosestEdge(self.data);
            setDragState({ type: "dragging-over", closestEdge });
          } else if ("itemId" in source.data) {
            setDragState({ type: "dragging-folder-over" });
          }
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
    <div ref={ref}
      className="cursor-grab relative"
      data-folder-wrapper={folder.id}>
      {/* 드래그 인디케이터 */}
      {dragState.type === "dragging-over" && dragState.closestEdge && (
        <DropIndicator edge={dragState.closestEdge} gap="0px" />
      )}
      <Folder folder={folder} dragStateType={dragState.type} />
    </div>
  );
}
