import { useState, useEffect } from 'react';
import { ReportService } from '@/app/services/report.service';
import { DocumentData } from 'firebase/firestore';

export const useReport = () => {
    const [report, setReport] = useState<DocumentData | null>(null);
    const [csvData, setCsvData] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Tạo báo cáo
    const generateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const newReport = await ReportService.generateReport();
            setReport(newReport);
        } catch (err) {
            setError('Failed to generate report');
            console.error('Error generating report:', err);
        } finally {
            setLoading(false);
        }
    };

    // Xuất CSV
    const exportCsv = async () => {
        setLoading(true);
        setError(null);
        try {
            const csv = await ReportService.exportCsv();
            setCsvData(csv);
        } catch (err) {
            setError('Failed to export CSV');
            console.error('Error exporting CSV:', err);
        } finally {
            setLoading(false);
        }
    };

    return { report, csvData, loading, error, generateReport, exportCsv };
};