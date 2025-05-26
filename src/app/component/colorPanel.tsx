interface ColorPanelProps {
  hex: string,
  selected?: boolean,
  onSelect?: (hex: string) => void
} 
export default function ColorPanel({ hex, selected, onSelect } : ColorPanelProps ) {
  return (
    <div
      className="inline-block"
      onClick={() => onSelect && onSelect(hex) }
    >
      <button className={`flex items-center justify-center rounded-full w-[22px] h-[22px] border-transparent border-[1px] hover:border-gray-400/80 p-[3px] cursor-pointer`} style={{borderColor: selected ? '#3c7fff' : ''}}>
        <span className='block rounded-full w-[14.4px] h-[14.4px]' style={{backgroundColor: `#${hex}`}}></span>
      </button>
    </div>
  )
}