"use client";

import { Fragment } from "react";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import Button from "../Button/Button";
import { IDialogProps } from "./Dialog.Model";

const Dialog = ({
  isOpen,
  onCancel,
  onConfirm,
  title,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  size = "md",
}: IDialogProps) => {
  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  }[size];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <HeadlessDialog as="div" className="relative z-50" onClose={onCancel}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-50"
          leave="ease-in duration-200"
          leaveFrom="opacity-50"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#d0d5dbad]" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <HeadlessDialog.Panel
              className={`bg-white rounded-2xl w-full ${sizeClass} p-6 shadow-lg`}
            >
              {/* Header */}
              {title && (
                <HeadlessDialog.Title className="text-lg font-semibold text-gray-800">
                  {title}
                </HeadlessDialog.Title>
              )}

              {/* Content */}
              <div className="mt-4">{children}</div>

              {/* Footer: Cancel + Confirm */}
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  onClick={onCancel}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                  disabled={loading}
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={onConfirm}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  disabled={loading}
                >
                  {confirmText}
                </Button>
              </div>
            </HeadlessDialog.Panel>
          </Transition.Child>
        </div>
      </HeadlessDialog>
    </Transition>
  );
};

export default Dialog;
