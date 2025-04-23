'use client'
import { useState, useEffect } from "react";
import type { RootState } from "@/app/store/store";
import { useSelector, useDispatch } from "react-redux";

export default function Modal() {
  const dispatch = useDispatch();

  const modalState = useSelector((state: RootState) =>
    state.modal
  ) as Modal;

  // 적용 버튼
  let applyBtnClass = "dft-apply-btn";
  switch (modalState.type) {
    case "confirm":
      applyBtnClass = "dft-apply-btn";
      break;
    case "delete":
      applyBtnClass = "dft-delete-btn";
      break;
    default:
      applyBtnClass = "dft-btn";
  }
  // 취소 버튼
  let closeBtnClass = "dft-btn";
  switch (modalState.type) {
    case "confirm":
      closeBtnClass = "dft-btn";
      break;
    case "delete":
      closeBtnClass = "dft-btn";
      break;
    case "alert":
      closeBtnClass = "dft-btn";
      break;
    default:
      closeBtnClass = "dft-btn";
  }

  console.log(`modalState:`, modalState);
  return (
    <>
    {
    modalState.isOpen &&
      <div className="h-screen w-screen fixed top-0 left-0 bg-gray-500/30 z-100 flex justify-center items-center">
        <div className="relative flex flex-col justify-between z-101 bg-white shadow-[var(--modalShadow)] w-[320px] min-h-[100px] rounded-[6px] p-[15px] pt-[20px] top-[-80px]">
          <div>
            <h2 className="text-center font-[500]">{modalState.title}</h2>
          </div>
          <div>
            <p></p>
          </div>
          <div className="flex justify-end items-center">
            {
              ["confirm", "delete"].includes(modalState.type) &&
              <button type="button" className={`${applyBtnClass} mr-[5px] w-[53px]`}
              >{modalState.buttonText?.apply}</button>
            }
            <button type="button" className={closeBtnClass}
            >{modalState.buttonText?.close}</button>
          </div>
        </div>
      </div>
    }
    </>
  );
}