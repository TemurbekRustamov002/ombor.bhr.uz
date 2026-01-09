export default function Loading() {
    return (
        <div className="flex h-full w-full items-center justify-center min-h-[500px]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-gray-100 border-t-primary animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-primary animate-ping"></div>
                    </div>
                </div>
                <p className="text-sm font-medium text-gray-500 animate-pulse">Yuklanmoqda...</p>
            </div>
        </div>
    );
}
