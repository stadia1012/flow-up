import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import type { CSSProperties, HTMLAttributes } from 'react';

type Orientation = 'horizontal' | 'vertical';

const edgeToOrientationMap: Record<Edge, Orientation> = {
  top: 'horizontal',
  bottom: 'horizontal',
  left: 'vertical',
  right: 'vertical',
};

const orientationStyles: Record<Orientation, string> = {
  horizontal: `
    h-[var(--line-thickness)]
    left-[var(--terminal-radius)]
    right-0
    before:left-[var(--negative-terminal-size)]
  `,
  vertical: `
    w-[var(--line-thickness)]
    top-[var(--terminal-radius)]
    bottom-0
    before:top-[var(--negative-terminal-size)]
  `,
};

const edgeStyles: Record<Edge, string> = {
  top: 'top-[var(--line-offset)] before:top-[var(--offset-terminal)]',
  right: 'right-[var(--line-offset)] before:right-[var(--offset-terminal)]',
  bottom: 'bottom-[var(--line-offset)] before:bottom-[var(--offset-terminal)]',
  left: 'left-[var(--line-offset)] before:left-[var(--offset-terminal)]',
};

const strokeSize = 1;
const terminalSize = 8;
const offsetToAlignTerminalWithLine = (strokeSize - terminalSize) / 2;

export function DropIndicator({ edge, gap }: { edge: Edge; gap: string }) {
  const lineOffset = `calc(-0.5 * (${gap} + ${strokeSize}px))`;

  const orientation = edgeToOrientationMap[edge];

  return (
    <div
      style={
        {
          '--line-thickness': `${strokeSize}px`,
          '--line-offset': `${lineOffset}`,
          '--terminal-size': `${terminalSize}px`,
          '--terminal-radius': `${terminalSize / 2}px`,
          '--negative-terminal-size': `-${terminalSize}px`,
          '--offset-terminal': `${offsetToAlignTerminalWithLine}px`,
        } as CSSProperties
      }
      className={`absolute z-10 bg-blue-400 pointer-events-none before:content-[''] before:w-[var(--terminal-size)] before:h-[var(--terminal-size)] box-border before:absolute before:border-[length:var(--line-thickness)] before:border-solid before:border-blue-400 before:rounded-full ${
        orientationStyles[orientation]
      } ${[edgeStyles[edge]]}`}
    ></div>
  );
}