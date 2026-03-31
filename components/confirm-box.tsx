'use client';
import { Dispatch, SetStateAction, useState } from "react";

type ConfirmBoxProps = {
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmBox({ message = 'Are you sure?', onConfirm, onCancel }: ConfirmBoxProps) {

    return (
        <section
            className="fixed inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm z-50 "
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}>

            <div className="bg-background/90 border border-foreground/20 p-8 rounded-xl shadow-lg w-full max-w-lg overflow-auto">
                <div className="flex flex-col space-y-4 items-center">
                    <h2 className="text-sm mb-6 ">{message}</h2>
                    <div className="flex flex-row justify-center gap-10 items-center ">
                        <button
                            onClick={onCancel}
                            className="px-3 py-1 bg-accent text-background rounded-md hover:bg-accent/90 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-3 py-1 bg-accent text-background rounded-md hover:bg-accent/90 transition"
                        >
                            Submit
                        </button>
                    </div>
                </div>

            </div>
        </section >
    )
}


