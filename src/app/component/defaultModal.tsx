'use client'
export default function DefaultModal(props : ModalProps) {
  // 적용 버튼
  let confirmBtnClass = "dft-apply-btn";
  switch (props.type) {
    case "confirm":
      confirmBtnClass = "dft-apply-btn";
      break;
    case "delete":
      confirmBtnClass = "dft-delete-btn";
      break;
    default:
      confirmBtnClass = "dft-btn";
  }
  // 취소 버튼
  let cancelBtnClass = "dft-btn";
  switch (props.type) {
    case "confirm":
      cancelBtnClass = "dft-btn";
      break;
    case "delete":
      cancelBtnClass = "dft-btn";
      break;
    case "alert":
      cancelBtnClass = "dft-apply-btn mr-[5px] w-[53px]";
      break;
    default:
      cancelBtnClass = "dft-btn";
  }

  console.log(`modalState:`, props);
  return (
    <>
      <div className="h-screen w-screen fixed top-0 left-0 bg-gray-500/30 z-100 flex justify-center items-center">
        <div className="relative flex flex-col justify-between z-101 bg-white shadow-[var(--modalShadow)] w-[320px] min-h-[100px] rounded-[6px] p-[15px] pt-[20px] top-[-80px]">
          <div>
            <h2 className="text-center font-[500]">{props.title}</h2>
          </div>
          <div>
            <p className="text-center">{props.description}</p>
          </div>
          <div className="flex justify-end items-center">
            {
              // 확인 버튼
              ["confirm", "delete"].includes(props.type) &&
              <button
                type="button"
                className={`${confirmBtnClass} mr-[5px] w-[53px]`}
                onClick={() => { props.onConfirm?.(); }}
              >{props.buttonText?.confirm}</button>
            }
            { /* cancel 버튼 */ }
            <button
              type="button"
              className={cancelBtnClass}
              onClick={() => { props.onCancel?.(); }}
            >{props.buttonText?.cancel}</button>
          </div>
        </div>
      </div>
    </>
  );
}