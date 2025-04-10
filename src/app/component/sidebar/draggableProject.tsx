'use client'
import { useState, useEffect, useRef } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import Project from "./project";
import { DropIndicator } from "./drop-indicator";

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
      // 드래그 가능하도록 등록
      draggable({
        element: element,
        getInitialData() {
          return { projectId: project.id };
        },
      }),
      // 개별 항목에 dropTarget 등록 (시각적 피드백)
      dropTargetForElements({
        element,
        canDrop({ source }) {
          // 자신에게 드롭되지 않도록 처리
          if (source.element === element) return false;
          return source.data && ("projectId" in source.data || "folderId" in source.data);
        },
        getData({ input }) {
          // attachClosestEdge를 이용해 현재 요소의 가장 가까운 엣지 정보를 포함한 데이터를 반환
          return attachClosestEdge({ projectId: project.id }, { element, input, allowedEdges: ["top", "bottom"] });
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
      className={`cursor-grab relative`}
      data-project-wrapper={project.id}>
      {/* 드래그 인디케이터 */}
      {dragState.type === "dragging-over" && dragState.closestEdge && (
        <DropIndicator edge={dragState.closestEdge} gap="0px" />
      )}
      <Project project={project} dragStateType={dragState.type} />
    </div>
  );
}
