// components/OrgTree.tsx
"use client";
import React, { useState, useEffect, ReactElement } from "react";
import { Spin, Alert } from "antd";
import Tree, { DataNode } from "antd/lib/tree";
import { useToast } from '@/app/context/ToastContext';

type OrgNode = {
  key: string;
  title: string;
  children?: OrgNode[];
  icon?: ReactElement;
};

export const userIcon = () => (<svg
  className="h-[18px] w-[18px] text-blue-300 relative top-[3px]"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="currentColor"
  stroke="#2b7fff"
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
  <path d="M6 20v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
</svg>)

export const deptIcon = () => (<svg
  className="h-[18px] w-[18px] relative top-[3px]"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="#ffe1aa"
  stroke="#ffa600"
  strokeWidth="1"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
</svg>)

const addIconToNodes = (nodes: OrgNode[]) => {
  return nodes.map(node => {
    // 현재 노드에 icon 추가
    if (node.key.startsWith('d-')) {
      node.icon = deptIcon();
    } else if (node.key.startsWith('u-')) {
      node.icon = userIcon();
    }

    // 자식 노드 재귀적 처리
    if (node.children && node.children.length > 0) {
      node.children = addIconToNodes(node.children);
    }

    return node;
  });
}

export default function OrgTree({onNodeSelect}: {
  onNodeSelect: (
    {type, id, title}: {
      type: 'user' | 'department',
      id: string,
      title: string
    }
  ) => void}
) {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/org-tree")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json() as Promise<OrgNode[]>;
      })
      .then((data) => {
        setTreeData(addIconToNodes(data));
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex relative items-center w-full h-full justify-center top-[-15px]"><Spin /></div>;
  if (error) return <Alert type="error" message={error} />;

  return <Tree treeData={treeData} showIcon onSelect={(keys, info) => {
    const key = info.node.key.toString();
    const type = key.charAt(0) === 'd' ? 'department' : 'user'
    const title = info.node.title?.toString() || '';
    const id = key.slice(2);
    if (info) {
      onNodeSelect({type, id, title});
    }
  }} />;
}