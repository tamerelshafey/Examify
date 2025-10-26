import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMarketplaceBankById, purchaseBank } from '../services/api';
import { MarketplaceQuestionBank, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeftIcon, LockIcon } from '../components/icons';

const translations = {
    en: {
        title: "Complete Your Purchase",
        backToMarketplace: "Back to Marketplace",
        orderSummary: "Order Summary",
        total: "Total",
        paymentDetails: "Payment Details",
        cardNumber: "Card Number",
        expiryDate: "Expiry Date (MM/YY)",
        cvc: "CVC",
        payNow: "Pay Now",
        paying: "Processing...",
        purchaseSuccess: "Purchase successful! The bank has been added to your collection.",
        purchaseError: "There was an error processing your payment.",
        bankNotFound: "The requested question bank could not be found.",
    },
    ar: {
        title: "أكمل عملية الشراء",
        backToMarketplace: "العودة إلى المتجر",
        orderSummary: "ملخص الطلب",
        total: "الإجمالي",
        paymentDetails: "تفاصيل الدفع",
        cardNumber: "رقم البطاقة",
        expiryDate: "تاريخ انتهاء الصلاحية (MM/YY)",
        cvc: "CVC",
        payNow: "ادفع الآن",
        paying: "جاري المعالجة...",
        purchaseSuccess: "تم الشراء بنجاح! تمت إضافة البنك إلى مجموعتك.",
        purchaseError: "حدث خطأ أثناء معالجة الدفع.",
        bankNotFound: "تعذر العثور على بنك الأسئلة المطلوب.",
    }
};

const CheckoutPage: React.FC = () => {
    const { bankId } = useParams<{ bankId: string }>();
    const { userRole } = useAuth(); // Assuming useAuth provides the current user's ID
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const { lang } = useLanguage();
    const t = translations[lang];

    const [bank, setBank] = useState<MarketplaceQuestionBank | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const backPath = `/${userRole}/question-bank`; // Simplified back path

    useEffect(() => {
        if (!bankId) {
            navigate(backPath);
            return;
        }

        const fetchBank = async () => {
            setLoading(true);
            try {
                const bankData = await getMarketplaceBankById(bankId);
                if (bankData) {
                    setBank(bankData);
                } else {
                    addNotification(t.bankNotFound, 'error');
                    navigate(backPath);
                }
            } catch (error) {
                console.error(error);
                navigate(backPath);
            } finally {
                setLoading(false);
            }
        };

        fetchBank();
    }, [bankId, navigate, backPath, addNotification, t.bankNotFound]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bankId) return;

        setIsProcessing(true);
        try {
            // In a real app, this would use the actual logged-in user's ID
            const MOCK_USER_ID = 'user-1'; 
            await purchaseBank(MOCK_USER_ID, bankId);
            addNotification(t.purchaseSuccess, 'success');
            navigate(backPath, { state: { tab: 'marketplace' } });
        } catch (error) {
            console.error(error);
            addNotification(t.purchaseError, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout navLinks={[]} pageTitle="">
                <LoadingSpinner />
            </DashboardLayout>
        );
    }

    if (!bank) {
        return (
             <DashboardLayout navLinks={[]} pageTitle="">
                <p>{t.bankNotFound}</p>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout navLinks={[]} pageTitle={t.title}>
            <button onClick={() => navigate(backPath)} className="flex items-center text-sm text-primary-500 hover:underline mb-6">
                <ArrowLeftIcon className="w-4 h-4 me-1" />
                {t.backToMarketplace}
            </button>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">{t.orderSummary}</h3>
                    <div className="space-y-4">
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100">{bank.title}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">by {bank.authorName}</p>
                            <p className="text-right font-bold text-lg mt-2">${bank.price.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold border-t border-slate-200 dark:border-slate-700 pt-4">
                            <span>{t.total}</span>
                            <span>${bank.price.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">{t.paymentDetails}</h3>
                    <form onSubmit={handlePayment} className="space-y-4">
                        <div>
                            <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.cardNumber}</label>
                            <input type="text" id="cardNumber" placeholder="0000 0000 0000 0000" className="mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.expiryDate}</label>
                                <input type="text" id="expiryDate" placeholder="MM/YY" className="mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" required />
                            </div>
                             <div>
                                <label htmlFor="cvc" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.cvc}</label>
                                <input type="text" id="cvc" placeholder="123" className="mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500" required />
                            </div>
                        </div>
                        <button type="submit" disabled={isProcessing} className="w-full flex justify-center items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50">
                            <LockIcon className="w-5 h-5" />
                            {isProcessing ? t.paying : `${t.payNow} $${bank.price.toFixed(2)}`}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CheckoutPage;
