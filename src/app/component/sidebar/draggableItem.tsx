'use client'
import { useState, useEffect, useRef } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import Item from "./item";
import { DropIndicator } from "./dropIndicator";

type DragState =
  | { type: "idle" }
  | { type: "dragging-over"; closestEdge: ReturnType<typeof extractClosestEdge> };

export default function DraggableItem({ item, project, folder }: { item: List, project: List, folder: List }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState>({ type: "idle" });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return combine(
      // 드래그 시 sourceData
      draggable({
        element: element,
        canDrag({ element }) {
          // 드래그 비활성화
          if (element.querySelector('input, .popup-menu')) {
            return false;
          }
          return true;
        },
        getInitialData() {
          return { itemId: item.id, parentId: item.parentId, order: item.order }; // 드래그 시 전달 데이터
        },
      }),
      // 개별 항목에 dropTarget 등록
      dropTargetForElements({
        element,
        canDrop({ source }) {
          // 자신에게 드롭 방지
          if (source.element === element) return false; 
          return source.data && "itemId" in source.data;
        },
        // drop 시 targetData
        getData({ input }) {
          return attachClosestEdge(
              { itemId: item.id, parentId: item.parentId, order: item.order },
              { element, input, allowedEdges: ["top", "bottom"] }
            )
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
  }, [item]);

  return (
    <div ref={ref}
      className="cursor-grab relative"
      data-item-wrapper={item.id}>
      {/* 드래그 인디케이터 */}
      {dragState.type === "dragging-over" && dragState.closestEdge && (
        <DropIndicator edge={dragState.closestEdge} gap="0px" />
      )}
      <Item item={item} project={project} folder={folder} />
    </div>
  );
}
