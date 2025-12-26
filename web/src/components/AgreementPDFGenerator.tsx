'use client';

import { useState, useRef } from 'react';

interface AgreementPDFProps {
    agreement: {
        id: string;
        landlordName: string;
        landlordPhone: string;
        tenantName: string;
        tenantPhone: string;
        tenantGhanaCard: string;
        propertyAddress: string;
        monthlyRent: number;
        advanceMonths: number;
        startDate: string;
        endDate: string;
        securityDeposit: number;
        stampDuty: number;
        additionalTerms?: string;
    };
}

export default function AgreementPDFGenerator({ agreement }: AgreementPDFProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const formatPrice = (price: number) => `GH₵${price.toLocaleString()}`;
    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const handlePrint = () => {
        setIsGenerating(true);
        setTimeout(() => {
            window.print();
            setIsGenerating(false);
        }, 500);
    };

    const handleDownload = async () => {
        setIsGenerating(true);

        // In production, this would call a PDF generation API
        // For now, we use the browser's print-to-PDF functionality
        alert('To download as PDF:\n1. Click Print\n2. Select "Save as PDF" as the destination\n3. Click Save');

        setTimeout(() => {
            window.print();
            setIsGenerating(false);
        }, 500);
    };

    return (
        <div>
            {/* Action Buttons */}
            <div className="flex gap-3 mb-6 print:hidden">
                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="btn-primary flex items-center gap-2"
                >
                    📥 Download PDF
                </button>
                <button
                    onClick={handlePrint}
                    disabled={isGenerating}
                    className="btn-secondary flex items-center gap-2"
                >
                    🖨️ Print
                </button>
            </div>

            {/* PDF Content */}
            <div ref={printRef} className="bg-white p-8 print:p-0">
                {/* Header */}
                <div className="text-center border-b-2 border-gray-900 pb-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        RENTAL AGREEMENT
                    </h1>
                    <p className="text-gray-600">Republic of Ghana</p>
                    <p className="text-sm text-gray-500">Agreement ID: {agreement.id}</p>
                </div>

                {/* Parties */}
                <section className="mb-6">
                    <h2 className="font-bold text-gray-900 mb-3">1. PARTIES</h2>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-semibold text-gray-700">LANDLORD</p>
                            <p className="text-gray-900">{agreement.landlordName}</p>
                            <p className="text-gray-600">{agreement.landlordPhone}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-semibold text-gray-700">TENANT</p>
                            <p className="text-gray-900">{agreement.tenantName}</p>
                            <p className="text-gray-600">{agreement.tenantPhone}</p>
                            <p className="text-gray-500 text-xs">Ghana Card: {agreement.tenantGhanaCard}</p>
                        </div>
                    </div>
                </section>

                {/* Property Details */}
                <section className="mb-6">
                    <h2 className="font-bold text-gray-900 mb-3">2. PROPERTY</h2>
                    <p className="text-gray-700">{agreement.propertyAddress}</p>
                </section>

                {/* Rental Terms */}
                <section className="mb-6">
                    <h2 className="font-bold text-gray-900 mb-3">3. RENTAL TERMS</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Monthly Rent:</p>
                            <p className="font-semibold text-gray-900">{formatPrice(agreement.monthlyRent)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Advance Period:</p>
                            <p className="font-semibold text-gray-900">{agreement.advanceMonths} months</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Start Date:</p>
                            <p className="font-semibold text-gray-900">{formatDate(agreement.startDate)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">End Date:</p>
                            <p className="font-semibold text-gray-900">{formatDate(agreement.endDate)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Security Deposit:</p>
                            <p className="font-semibold text-gray-900">{formatPrice(agreement.securityDeposit)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Stamp Duty Paid:</p>
                            <p className="font-semibold text-gray-900">{formatPrice(agreement.stampDuty)}</p>
                        </div>
                    </div>
                </section>

                {/* Standard Terms */}
                <section className="mb-6">
                    <h2 className="font-bold text-gray-900 mb-3">4. STANDARD TERMS & CONDITIONS</h2>
                    <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                        <li>The Tenant shall pay rent in advance as specified above.</li>
                        <li>The Tenant shall use the premises solely for residential purposes.</li>
                        <li>The Tenant shall maintain the property in good condition.</li>
                        <li>The Tenant shall not sublet the property without written consent.</li>
                        <li>The Landlord shall ensure the property is habitable at all times.</li>
                        <li>Either party may terminate with 3 months written notice.</li>
                        <li>The security deposit shall be returned within 30 days of vacating.</li>
                        <li>This agreement is governed by the laws of the Republic of Ghana.</li>
                    </ol>
                </section>

                {/* Additional Terms */}
                {agreement.additionalTerms && (
                    <section className="mb-6">
                        <h2 className="font-bold text-gray-900 mb-3">5. ADDITIONAL TERMS</h2>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{agreement.additionalTerms}</p>
                    </section>
                )}

                {/* Signatures */}
                <section className="mt-12 pt-6 border-t border-gray-300">
                    <h2 className="font-bold text-gray-900 mb-6">SIGNATURES</h2>
                    <div className="grid grid-cols-2 gap-12">
                        <div>
                            <div className="border-b border-gray-400 h-16 mb-2" />
                            <p className="font-semibold text-gray-900">{agreement.landlordName}</p>
                            <p className="text-sm text-gray-600">Landlord</p>
                            <p className="text-xs text-gray-500 mt-2">Date: _______________</p>
                        </div>
                        <div>
                            <div className="border-b border-gray-400 h-16 mb-2" />
                            <p className="font-semibold text-gray-900">{agreement.tenantName}</p>
                            <p className="text-sm text-gray-600">Tenant</p>
                            <p className="text-xs text-gray-500 mt-2">Date: _______________</p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                    <p>Generated by FreeWahala Ghana • www.freewahala.com</p>
                    <p>This document is legally binding under Ghana Rent Act</p>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content, #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
