'use client'
import { useState, useEffect, useRef } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import Project from "./project";
import { DropIndicator } from "./dropIndicator";

type DragState =
  | { type: "idle" }
  | { type: "dragging-over"; closestEdge: ReturnType<typeof extractClosestEdge> }
  | { type: "dragging-folder-over"; };

export default function DraggableProject({ project }: { project: List }) {
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
          return { projectId: project.id, order: project.order };
        },
      }),
      // 개별 항목에 dropTarget 등록
      dropTargetForElements({
        element,
        canDrop({ source }) {
          // 자신에게 드롭 방지
          if (source.element === element) return false;
          return source.data && ("projectId" in source.data || "folderId" in source.data);
        },
        getData({ input }) {
          // drop 시 targetData
          return attachClosestEdge({ projectId: project.id, order: project.order }, { element, input, allowedEdges: ["top", "bottom"] });
        },
        getIsSticky() {
          return true;
        },
        onDragEnter({ self, source }) {
          if ("projectId" in source.data) {
            const closestEdge = extractClosestEdge(self.data);
            setDragState({ type: "dragging-over", closestEdge });
          } else if ("folderId" in source.data) {
            setDragState({ type: "dragging-folder-over" });
          }
        },
        onDrag({ self, source }) {
          if ("projectId" in source.data) {
            const closestEdge = extractClosestEdge(self.data);
            setDragState({ type: "dragging-over", closestEdge });
          } else if ("folderId" in source.data) {
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
  }, [project]);

  return (
    <div ref={ref}
      className={`cursor-grab relative w-full`}
      data-project-wrapper={project.id}
      data-order={project.order}>
      {/* 드래그 인디케이터 */}
      {dragState.type === "dragging-over" && dragState.closestEdge && (
        <DropIndicator edge={dragState.closestEdge} gap="0px" />
      )}
      <Project project={project} dragStateType={dragState.type} />
    </div>
  );
}
