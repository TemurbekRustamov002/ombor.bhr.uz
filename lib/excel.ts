import * as XLSX from 'xlsx';

/**
 * Senior-level Excel Export Engine
 * Focuses on readability, data integrity, and professional presentation.
 */

export function exportReportWithConfig(data: any[], config: any[], fileName: string, reportTitle: string = "HISOBOT") {
    // 1. Create WorkBook
    const wb = XLSX.utils.book_new();

    // 2. Prepare Header Area
    const titleRow = [["NAVBAHOR TEKSTIL KLASTERI"]];
    const reportNameRow = [[reportTitle.toUpperCase()]];
    const reportDateRow = [[`Hisobot yaratilgan sana: ${new Date().toLocaleString('uz-UZ')}`]];
    const separator = [[]]; // Empty row for space

    // 3. Prepare Table Headers
    const headers = [["№", ...config.map(c => c.label.toUpperCase())]];

    // 4. Prepare Data
    const body = data.map((item, index) => [
        index + 1,
        ...config.map(c => {
            const keys = c.key.split('.');
            let value = item;
            for (const key of keys) {
                value = value?.[key];
            }

            // Format numbers if they seem like numbers
            if (typeof value === 'number') {
                return value.toLocaleString('uz-UZ');
            }

            return value || '—';
        })
    ]);

    // 5. Combine everything into WorkSheet
    const ws = XLSX.utils.aoa_to_sheet([
        ...titleRow,
        ...reportNameRow,
        ...reportDateRow,
        ...separator,
        ...headers,
        ...body
    ]);

    // 6. Professional Formatting (Column Widths)
    const wscols = [
        { wch: 6 }, // Order number
        ...config.map(c => ({ wch: Math.max(c.label.length + 5, 20) }))
    ];
    ws['!cols'] = wscols;

    // 7. Add to Workbook and Save
    XLSX.utils.book_append_sheet(wb, ws, 'Hisobot');

    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${fileName}_${timestamp}.xlsx`);
}

/**
 * REPORT: Warehouse Activity Master Logic
 */
export function exportWarehouseTransactions(transactions: any[]) {
    const config = [
        { label: "Amaliyot Turi", key: "typeLabel" },
        { label: "Mahsulot", key: "product.name" },
        { label: "Kategoriya", key: "product.category" },
        { label: "Miqdor", key: "amount" },
        { label: "O'lchov Birligi", key: "product.unit" },
        { label: "Kontragent (Fermer)", key: "farmer.ni" },
        { label: "Mas'ul Xodim", key: "createdBy.fullName" },
        { label: "Vaqti", key: "formattedDate" }
    ];

    const typeLabels: any = { 'IN': 'KIRIM', 'OUT': 'CHIQIM', 'TRANSFER': 'O\'TKAZMA' };

    const mappedData = transactions.map(t => ({
        ...t,
        typeLabel: typeLabels[t.type] || t.type,
        formattedDate: new Date(t.date).toLocaleString('uz-UZ')
    }));

    exportReportWithConfig(mappedData, config, "Ombor_Tranzaksiyalar", "OMBORXONA AMALIYOTLARI BO'YICHA MONITORING HISOBOTI");
}

/**
 * REPORT: Comprehensive Land & Agrotechnical Analysis
 */
export function exportBrigadeActivities(activities: any[]) {
    const config = [
        { label: "Kontur №", key: "contour.number" },
        { label: "Maydon (ga)", key: "contour.area" },
        { label: "Agrotexnik Tadbir", key: "workStage.name" },
        { label: "Mas'ul Brigadir", key: "brigadier.user.fullName" },
        { label: "Holati", key: "statusLabel" },
        { label: "Bajarilgan Sana", key: "completionDate" },
        { label: "Tizim Izohi", key: "comment" }
    ];

    const statusMap: any = {
        'PENDING': 'Kutilmoqda',
        'IN_PROGRESS': 'Jarayonda',
        'COMPLETED': 'Bajarildi',
        'CANCELLED': 'Bekor qilindi'
    };

    const mappedData = activities.map(a => ({
        ...a,
        statusLabel: statusMap[a.status] || a.status,
        completionDate: a.completionDate ? new Date(a.completionDate).toLocaleString('uz-UZ') : 'Navbatda'
    }));

    exportReportWithConfig(mappedData, config, "Agrotexnika_Hisoboti", "AGROTEXNIK TADBIRLAR VA YER NAZORATI HISOBOTI");
}

/**
 * REPORT: Contract Execution Analytics
 */
export function exportContractPerformance(farmers: any[], customConfig: any[]) {
    const config = [
        { label: "Fermer (NI)", key: "ni" },
        { label: "Shartnoma (t)", key: "planAmount" },
        { label: "Amalda (t)", key: "actualAmount" },
        { label: "Bajarilish %", key: "percent" },
        ...customConfig.map(c => ({ label: c.label, key: `customData.${c.key}` }))
    ];

    const mappedData = farmers.map(f => {
        const contract = (f.contracts as any[])?.[0] || { planAmount: 0, actualAmount: 0 };
        const plan = contract.planAmount || 0;
        const actual = contract.actualAmount || 0;
        return {
            ...f,
            planAmount: plan,
            actualAmount: actual,
            percent: plan > 0 ? ((actual / plan) * 100).toFixed(2) + '%' : '0.00%',
        };
    });

    exportReportWithConfig(mappedData, config, "Shartnomalar_Ijrosi", "SHARTNOMA MAJBURIYATLARI VA IJRO MONITORINGI");
}

/**
 * REPORT: Current Warehouse Inventory Status
 */
export function exportInventoryReport(products: any[]) {
    const config = [
        { label: "Kategoriya", key: "category" },
        { label: "Mahsulot nomi", key: "name" },
        { label: "O'lchov birligi", key: "unit" },
        { label: "Joriy qoldiq", key: "currentStock" },
        { label: "Minimal chegara", key: "minStockAlert" },
        { label: "Holat", key: "status" }
    ];

    const mappedData = products.map(p => ({
        ...p,
        status: p.currentStock <= p.minStockAlert ? 'KOMALISh' : 'YETARLI'
    }));

    exportReportWithConfig(mappedData, config, "Ombor_Qoldiqlar", "OMBORXONA JORIY QOLDIQLARI BO'YICHA HISOBOT");
}
