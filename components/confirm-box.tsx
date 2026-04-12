'use client';

type ConfirmBoxProps = {
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmBox({
    title = 'Submit quiz?',
    message = 'Review your answers one last time before finishing this attempt.',
    confirmLabel = 'Submit quiz',
    cancelLabel = 'Keep reviewing',
    onConfirm,
    onCancel,
}: ConfirmBoxProps) {

    return (
        <section
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}>

            <div className="w-full max-w-md rounded-[2rem] border border-foreground/10 bg-background/95 p-7 shadow-2xl">
                <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-2xl text-accent">
                        !
                    </div>
                    <h2 className="mt-4 text-2xl font-bold tracking-tight">{title}</h2>
                    <p className="mt-3 text-sm leading-6 text-foreground/70">{message}</p>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-full border border-foreground/15 px-4 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-background transition hover:opacity-90"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </section >
    )
}


