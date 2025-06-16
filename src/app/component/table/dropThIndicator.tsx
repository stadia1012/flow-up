import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import type { CSSProperties } from 'react';

const strokeSize = 1;
const terminalSize = 8;
const offsetToAlignTerminalWithLine = (strokeSize - terminalSize) / 2;

export function DropThIndicator({ edge, gap }: { edge: Edge; gap: string }) {
  return (
    <div
      style={
        {
          '--line-thickness': `${strokeSize}px`,
          '--terminal-size': `${terminalSize}px`,
          '--terminal-radius': `${terminalSize / 2}px`,
          '--negative-terminal-size': `-${terminalSize}px`,
          '--offset-terminal': `${offsetToAlignTerminalWithLine}px`,
        } as CSSProperties
      }
      className={`absolute mx-[5px] w-[1px] h-full
        box-border border-l border-blue-400 pointer-events-none
        before:content-[''] before:w-[8px] before:h-[8px] before:absolute before:border before:border-blue-400 before:rounded-full before:bg-white before:top-[-4px] before:left-[-4px] top-[0px]
        ${edge === 'right' && 'right-[-5px]'}
        ${edge === 'left' && 'left-[-6px]'} 
        `}
    ></div>
  );
}