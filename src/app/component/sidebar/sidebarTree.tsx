'use client'
import { useState, useRef, useEffect } from "react";
import { moveList } from '@/app/controllers/projectController';
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { useDispatch } from "react-redux";
import { moveProject }  from "@/app/store/projectsSlice";
import { flash } from "@/app/animation";
import DraggableProject from "./draggableProject";

export default function SidebarTree({ initialProjects }: { initialProjects: List[] }) {
  const dispatch = useDispatch();
  const [projects, setProjects] = useState(initialProjects);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  // 드래그 앤 드롭 - 드롭 영역
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    return dropTargetForElements({
      element: container,
      canDrop({ source }) {
        return source.data && "projectId" in source.data;
      },
      onDrop({ source, location }) {
        const sourceData = source.data;
        if (!sourceData || !("projectId" in sourceData)) return;

        const target = location.current.dropTargets[0];

        if (!target) return;
        const targetData = target.data;

        console.log(`target:`, target);
        console.log(`source:`, source);
        console.log(`s_parent: ${sourceData.parentId}, t_parent: ${targetData.parentId}`);

        // 유효하지 않은 target
        if (!targetData || !("projectId" in targetData)) return;

        const targetOrder = Number(targetData.order);
        const closestEdge = extractClosestEdge(targetData);
        let updateOrder = closestEdge === "top" ? targetOrder : targetOrder + 1;

        // 동일 폴더에서의 이동 && 후순위로의 이동은 updateOrder -1
        if (updateOrder > Number(sourceData.order)) updateOrder -= 1;

        // redux state 변경 (화면 변경)
        dispatch(moveProject({
          sourceId: Number(sourceData.projectId),
          updateOrder: Number(updateOrder)
        }));

        // DB 변경
        console.log(sourceData.projectId, Number(sourceData.order),updateOrder)
        moveList({
          type: 'project',
          id: Number(sourceData.projectId),
          originalParentId: 0,
          updateParentId: 0,
          originalOrder: Number(sourceData.order),
          updateOrder: updateOrder
        });

        // 이동 후 flash
        const element :Element | null = document.querySelector(`[data-project-wrapper="${sourceData.projectId}"]`);
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
      {
        [...(projects ?? [])].sort((a, b) => (a.order) - (b.order)).map((project) => (
          <DraggableProject key={project.id} project={project} />
        ))
      }
    </div>
  );
}