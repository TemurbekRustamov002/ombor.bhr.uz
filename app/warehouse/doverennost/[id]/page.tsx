
import { getTransactionById } from "@/app/actions/warehouse";
import DoverennostPrintable from "./DoverennostPrintable";
import { notFound } from "next/navigation";

export default async function DoverennostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const transaction = await getTransactionById(id);

    if (!transaction || !transaction.farmer) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center print:bg-white print:p-0 print:block">
            <div className="max-w-4xl w-full space-y-6 print:max-w-none print:m-0 print:space-y-0">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 no-print">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Ishonchnomani chop etish</h1>
                        <p className="text-gray-500 font-medium text-sm">Hujjat raqami: #{transaction.id.slice(-6).toUpperCase()}</p>
                    </div>
                </div>

                <div className="bg-white shadow-2xl rounded-sm overflow-hidden border border-gray-200 print:shadow-none print:border-none print:m-0">
                    <DoverennostPrintable transaction={transaction} />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    @page { margin: 0 !important; size: A4; }
                }
            ` }} />
        </div>
    );
}
