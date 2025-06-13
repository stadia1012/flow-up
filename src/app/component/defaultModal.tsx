'use client'
// ModalProps 타입 정의
export interface ModalProps {
  type: 'confirm' | 'delete' | 'alert';
  title: string;
  description?: string;
  buttonText?: {
    confirm?: string;
    cancel?: string;
  };
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function DefaultModal({
  type,
  title,
  description,
  buttonText,
  onConfirm,
  onCancel} : ModalProps) {
  // 적용 버튼
  let confirmBtnClass = "dft-apply-btn";
  switch (type) {
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
  switch (type) {
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

  return (
    <>
      <div className="h-screen w-screen fixed top-0 left-0 bg-gray-500/30 z-100 flex justify-center items-center" onClick={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}>
        <div className="relative flex flex-col justify-between z-101 bg-white shadow-[var(--modalShadow)] w-[320px] min-h-[100px] rounded-[6px] p-[15px] pt-[20px] top-[-80px]">
          <div className="flex flex-col mb-[10px]">
            <h2 className="text-center font-[500] whitespace-pre-line">{title}</h2>
          </div>
          <div>
            <p className="text-center">{description}</p>
          </div>
          <div className="flex justify-end items-center">
            {
              // 확인 버튼
              ["confirm", "delete"].includes(type) &&
              <button
                id="default-modal-confirm"
                type="button"
                className={`${confirmBtnClass} mr-[5px] w-[53px]`}
                onMouseDown={e => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm?.(); 
                }}
              >{buttonText?.confirm ?? ((type === 'delete') ? '삭제' : '취소')}</button>
            }
            { /* cancel 버튼 */ }
            <button
              id="default-modal-cancel"
              type="button"
              className={`${cancelBtnClass}`}
              onMouseDown={e => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.();
              }}
            >{buttonText?.cancel ?? ((type === 'alert') ? '확인' : '취소')}</button>
          </div>
        </div>
      </div>
    </>
  );
}