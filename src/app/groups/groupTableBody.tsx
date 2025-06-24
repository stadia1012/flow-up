export default function GroupTableBody() {
  
  return (
    <tbody>
      {/* row */}
      <tr className="hover:bg-gray-100/90 transition h-[28px] box-border">
        <td>
          <div className="flex items-center justify-center">
            <input type="checkbox" />
          </div>
        </td>
        <td>
          <div className="text-[14px] text-center">IT인프라파트</div>
        </td>
        {/* department */}
        <td>
          <div className="flex items-center justify-center">
            <svg
              className="h-[18px] w-[18px]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#ffe1aa"
              stroke="#ffa600"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
            </svg>
            <span className="text-[14px] ml-[3px]">0</span>
          </div>
        </td>
        {/* user */}
        <td>
          <div className="flex items-center justify-center">
            <svg
              className="h-[18px] w-[18px] text-blue-300"
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
            </svg>
            <span className="text-[14px] ml-[1px]">0</span>
          </div>
        </td>
        <td>
          <div className="flex justify-center">
            <button
              type="button"
              className="cursor-pointer hover:bg-gray-200/80 transition rounded-[6px] h-[23px] w-[23px] p-[2px]">
              <svg
                className="text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 6a7.75 7.75 0 1 0 10 0" />
                <path d="M12 4l0 8" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  )
}