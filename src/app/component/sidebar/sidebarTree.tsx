'use client'
import { useState, useRef, useEffect } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { flushSync } from "react-dom";
import { flash } from "@/app/animation";
import DraggableProject from "./draggableProject";

export default function SidebarTree({ initialProjects }: { initialProjects: List[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  // 드래그 앤 드롭
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 컨테이너 수준의 dropTarget 등록
    return dropTargetForElements({
      element: container,
      canDrop({ source }) {
        return source.data && "projectId" in source.data;
      },
      onDrop({ source, location }) {
        const sourceData = source.data;
        if (!sourceData || !("projectId" in sourceData)) return;

        // 컨테이너 하위에 등록된 각 항목의 dropTarget 중 하나가 타겟으로 선택
        const target = location.current.dropTargets[0];
        if (!target) return;

        const targetData = target.data;
        if (!targetData || !("projectId" in targetData)) return;

        const sourceIndex = projects.findIndex((p) => p.id === sourceData.projectId);
        const targetIndex = projects.findIndex((p) => p.id === targetData.projectId);
        if (sourceIndex < 0 || targetIndex < 0) return;

        const closestEdge = extractClosestEdge(targetData);
        flushSync(() => {
          setProjects(
            reorderWithEdge({
              list: projects,
              startIndex: sourceIndex,
              indexOfTarget: targetIndex,
              closestEdgeOfTarget: closestEdge,
              axis: "vertical",
            })
          );
        });

        // 드롭 후 해당 요소에 플래시 효과 적용
        const element = document.querySelector(`[data-project-wrapper="${sourceData.projectId}"]`);
        if (element instanceof Element) {
          setTimeout(() => {
            flash(element);
          }, 10)
        }
      },
    });
  }, [projects]);

  return (
    <div ref={containerRef} className="relative">
      {projects.map((project) => (
        <DraggableProject key={project.id} project={project} />
      ))}
    </div>
  );
}