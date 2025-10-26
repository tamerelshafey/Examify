import React, { useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AwardIcon, DownloadIcon, SpinnerIcon, XCircleIcon } from './icons';
import { UserRole } from '../types';

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    examineeName: string;
    examTitle: string;
    completionDate: Date;
    organizationName: string;
    aiCommendation: string;
    scorePercentage: number;
}

const translations = {
    en: {
        title: "Certificate of Completion",
        awardedTo: "is hereby awarded to",
        forCompleting: "for successfully completing the assessment",
        issuedOn: "Issued on",
        signature: "Signature",
        yourName: "Your Name",
        download: "Download PDF",
        generating: "Generating PDF...",
    },
    ar: {
        title: "شهادة إتمام",
        awardedTo: "تُمنح هذه الشهادة إلى",
        forCompleting: "لإتمامه بنجاح تقييم",
        issuedOn: "صدرت في",
        signature: "التوقيع",
        yourName: "اسمك",
        download: "تحميل PDF",
        generating: "جاري إنشاء PDF...",
    }
};

const CertificateModal: React.FC<CertificateModalProps> = ({
    isOpen,
    onClose,
    examineeName,
    examTitle,
    completionDate,
    organizationName,
    aiCommendation,
    scorePercentage
}) => {
    const { theme } = useTheme();
    const { lang } = useLanguage();
    const t = translations[lang];
    const certificateRef = useRef<HTMLDivElement>(null);
    const [signatureName, setSignatureName] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadPdf = () => {
        const { jsPDF } = (window as any).jspdf;
        const html2canvas = (window as any).html2canvas;

        if (certificateRef.current) {
            setIsDownloading(true);
            html2canvas(certificateRef.current, { scale: 2 }).then((canvas: any) => {
                const imgData = canvas.toDataURL('image/png');
                // A4 size in landscape
                const pdf = new jsPDF('l', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Certificate_${examineeName.replace(' ', '_')}_${examTitle.replace(' ', '_')}.pdf`);
                setIsDownloading(false);
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex justify-center items-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[95vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <AwardIcon className="w-6 h-6 text-primary-500"/>
                        {t.title}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </div>
                
                {/* Certificate Preview */}
                <div className="flex-grow overflow-y-auto mb-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                    <div ref={certificateRef} className="bg-white dark:bg-slate-950 p-12 aspect-[297/210] w-full border-4" style={{ borderColor: theme.primaryColor }}>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold uppercase" style={{ color: theme.primaryColor }}>{organizationName}</h1>
                            <h2 className="text-4xl font-bold mt-4 text-slate-800 dark:text-slate-200">{t.title}</h2>
                            <p className="mt-8 text-lg text-slate-600 dark:text-slate-400">{t.awardedTo}</p>
                            <p className="text-5xl font-signature text-slate-900 dark:text-slate-100 my-4">{examineeName}</p>
                            <p className="text-lg text-slate-600 dark:text-slate-400">{t.forCompleting}</p>
                            <p className="text-2xl font-bold mt-2 text-slate-800 dark:text-slate-200">"{examTitle}"</p>
                            <p className="text-sm mt-8 text-slate-500 dark:text-slate-400 italic max-w-2xl mx-auto">"{aiCommendation}"</p>
                            <div className="flex justify-between items-end mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.issuedOn}</p>
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">{completionDate.toLocaleDateString()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-signature text-3xl text-slate-800 dark:text-slate-200">{signatureName || '...'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-400 pt-1 mt-1">{t.signature}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                     <div className="flex-grow max-w-xs">
                        <label htmlFor="signatureName" className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.signature}</label>
                        <input
                            id="signatureName"
                            type="text"
                            placeholder={t.yourName}
                            value={signatureName}
                            onChange={(e) => setSignatureName(e.target.value)}
                            className="p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full mt-1 text-sm focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <button onClick={downloadPdf} disabled={isDownloading} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50">
                        {isDownloading ? <SpinnerIcon className="w-5 h-5"/> : <DownloadIcon className="w-5 h-5"/>}
                        {isDownloading ? t.generating : t.download}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CertificateModal;