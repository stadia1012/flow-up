'use client'
import { useState, useEffect, useRef } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import Folder from "./folder";
import { DropIndicator } from "./dropIndicator";

type DragState =
  | { type: "idle" }
  | { type: "dragging-over"; closestEdge: ReturnType<typeof extractClosestEdge> }
  | { type: "dragging-folder-over"; };

export default function DraggableFolder({ folder, project }: { folder: List, project: List }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState>({ type: "idle" });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return combine(
      draggable({
        // 드래그 시 sourceData
        element: element,
        canDrag({ element }) {
          // 드래그 비활성화
          if (element.querySelector('input, .popup-menu')) {
            return false;
          }
          return true;
        },
        getInitialData() {
          return { folderId: folder.id, parentId: folder.parentId, order: folder.order }; // 드래그 시 전달 데이터
        },
      }),
      // 개별 항목에 dropTarget 등록
      dropTargetForElements({
        element,
        canDrop({ source }) {
          if (source.element === element) return false; // 자신에게 드롭 방지
          return source.data && ("folderId" in source.data || "itemId" in source.data);
        },
        getData({ input }) {
          // drop 시 targetData
          return attachClosestEdge(
              { folderId: folder.id, parentId: folder.parentId, order: folder.order },
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
      className="cursor-grab relative w-full"
      data-folder-wrapper={folder.id}>
      {/* 드래그 인디케이터 */}
      {dragState.type === "dragging-over" && dragState.closestEdge && (
        <DropIndicator edge={dragState.closestEdge} gap="0px" />
      )}
      <Folder folder={folder} dragStateType={dragState.type} project={project} />
    </div>
  );
}
