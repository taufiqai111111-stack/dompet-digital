
const escapeCsvCell = (cellData: any): string => {
    const str = String(cellData ?? '');
    // Escape quotes and wrap in quotes if cell contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

export const downloadAsCsv = (fileName: string, headers: string[], data: any[][]) => {
    if (data.length === 0) {
        alert("Tidak ada data untuk diunduh.");
        return;
    }

    const csvRows = [
        headers.join(','),
        ...data.map(row => row.map(escapeCsvCell).join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    // Ensure filename ends with .csv
    const safeFileName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
    link.setAttribute("download", safeFileName);

    // Append, click, and remove the link
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
