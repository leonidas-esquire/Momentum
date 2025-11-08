import React, { useState, useEffect, useContext, useRef } from 'react';
import { User, Habit } from '../types';
import { Icon } from './Icon';
import { generateProgressAnalysisReport } from '../services/geminiService';
import { LanguageContext } from '../contexts/LanguageContext';

declare const html2canvas: any;
declare const jspdf: any;

interface ProgressAnalysisModalProps {
  user: User;
  habits: Habit[];
  onClose: () => void;
}

// Helper function to render inline formatting like bold and italic text
const renderInlineFormatting = (text: string) => {
    // Split by bold/italic tags, keeping the tags to process them
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-brand-text">{part.slice(2, -2)}</strong>;
        }
         if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i} className="italic">{part.slice(1, -1)}</em>;
        }
        return part;
    });
};

// Renders the full text with styled headings, paragraphs, and lists
const renderStyledText = (markdownText: string) => {
    const lines = markdownText.split('\n');
    const elements: React.ReactNode[] = [];
    let currentListItems: React.ReactNode[] = [];

    const flushList = () => {
        if (currentListItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
                    {currentListItems}
                </ul>
            );
            currentListItems = [];
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Treat blank lines as separators
        if (line.trim() === '') {
            flushList();
            continue;
        }
        
        const isListItem = line.startsWith('* ') || line.startsWith('- ');

        if (isListItem) {
            currentListItems.push(
                <li key={i}>{renderInlineFormatting(line.substring(2))}</li>
            );
        } else {
            flushList(); // End any existing list before processing a non-list item

            if (line.match(/^# /)) {
                elements.push(<h1 key={i} className="text-2xl font-bold mt-4 text-brand-text border-b-2 border-brand-secondary pb-2">{renderInlineFormatting(line.substring(2))}</h1>);
            } else if (line.match(/^## /)) {
                elements.push(<h2 key={i} className="text-xl font-bold mt-4 text-brand-text border-b border-brand-secondary/70 pb-1">{renderInlineFormatting(line.substring(3))}</h2>);
            } else if (line.match(/^### /) || line.match(/^\d\.\s/)) {
                const text = line.startsWith('###') ? line.substring(4) : line.substring(line.indexOf(' ') + 1);
                elements.push(<h3 key={i} className="text-lg font-bold mt-3 text-brand-primary">{renderInlineFormatting(text)}</h3>);
            } else {
                elements.push(<p key={i} className="my-2">{renderInlineFormatting(line)}</p>);
            }
        }
    }
    
    flushList(); // Flush any remaining list items at the end of the text

    return elements;
};


export const ProgressAnalysisModal: React.FC<ProgressAnalysisModalProps> = ({ user, habits, onClose }) => {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { language, t } = useContext(LanguageContext)!;
  const reportContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      const generatedReport = await generateProgressAnalysisReport(user, habits, language);
      setReport(generatedReport);
      setIsLoading(false);
    };

    fetchReport();
  }, [user, habits, language]);

  const handleExportToPDF = async () => {
    const { jsPDF } = jspdf;
    const content = reportContentRef.current;
    if (!content || !content.parentElement) return;

    // --- PDF Styling Constants ---
    const BRAND_COLOR = '#8A42D6';
    const TEXT_COLOR = '#E4E4E6';
    const BG_COLOR = '#1B1B1F';
    const Muted_COLOR = '#A0A0B0';
    const PAGE_MARGIN_X = 20; // Horizontal margin
    const HEADER_Y = 15; // Header Y position from top
    const FOOTER_Y = 15; // Footer Y position from bottom
    const CONTENT_TOP_Y = 30; // Increased top margin for content
    const CONTENT_BOTTOM_Y = 30; // Increased bottom margin for content

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // --- 1. Create Cover Page ---
    pdf.setFillColor(BG_COLOR);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(40);
    pdf.setTextColor(TEXT_COLOR);
    pdf.text("Momentum", pdfWidth / 2, 80, { align: 'center' });
    
    pdf.setFontSize(20);
    pdf.setTextColor(BRAND_COLOR);
    pdf.text("AI-Powered Progress Report", pdfWidth / 2, 100, { align: 'center' });
    
    pdf.setDrawColor(BRAND_COLOR);
    pdf.setLineWidth(0.5);
    pdf.line(PAGE_MARGIN_X, 130, pdfWidth - PAGE_MARGIN_X, 130);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor(Muted_COLOR);
    pdf.text("Prepared for:", PAGE_MARGIN_X, 150);
    
    pdf.setFontSize(18);
    pdf.setTextColor(TEXT_COLOR);
    pdf.text(user.name, PAGE_MARGIN_X, 160);
    
    pdf.setFontSize(12);
    pdf.setTextColor(Muted_COLOR);
    pdf.text(`Report Generated: ${new Date().toLocaleDateString()}`, PAGE_MARGIN_X, pdfHeight - 30);

    // --- 2. Capture Content with html2canvas ---
    const canvas = await html2canvas(content, { 
        scale: 2,
        backgroundColor: BG_COLOR,
        useCORS: true
    });
    const imgData = canvas.toDataURL('image/png');
    
    const imgProps = pdf.getImageProperties(imgData);
    const contentWidth = pdfWidth - PAGE_MARGIN_X * 2;
    const scaledImgHeight = (imgProps.height * contentWidth) / imgProps.width;
    
    // --- 3. Add Header and Footer ---
    const addHeader = (pdfInstance: any) => {
        pdfInstance.setFontSize(10);
        pdfInstance.setTextColor(Muted_COLOR);
        pdfInstance.text("Momentum: The Irresistible Habit App", PAGE_MARGIN_X, HEADER_Y);
    };

    const addFooter = (pdfInstance: any, pageNum: number, totalPages: number) => {
        pdfInstance.setFontSize(10);
        pdfInstance.setTextColor(Muted_COLOR);
        pdfInstance.text("Your Momentum App - Progress Report", PAGE_MARGIN_X, pdfHeight - FOOTER_Y);
        pdfInstance.text(`Page ${pageNum} of ${totalPages}`, pdfWidth - PAGE_MARGIN_X, pdfHeight - FOOTER_Y, { align: 'right' });
    };

    // --- 4. Paginate and Add Content ---
    const pageContentHeight = pdfHeight - CONTENT_TOP_Y - CONTENT_BOTTOM_Y;
    const totalPages = Math.ceil(scaledImgHeight / pageContentHeight);
    
    for (let i = 0; i < totalPages; i++) {
        pdf.addPage();
        addHeader(pdf);
        addFooter(pdf, i + 2, totalPages + 1);

        // Define a clipping region for the content to prevent overflow
        pdf.saveGraphicsState();
        pdf.rect(PAGE_MARGIN_X, CONTENT_TOP_Y, contentWidth, pageContentHeight);
        pdf.clip();
        
        // Position the full-size image. The clipping path will only show the relevant part.
        const yPos = CONTENT_TOP_Y - (i * pageContentHeight);
        pdf.addImage(imgData, 'PNG', PAGE_MARGIN_X, yPos, contentWidth, scaledImgHeight);
        
        // Restore graphics state to remove clipping for the next page
        pdf.restoreGraphicsState();
    }
    
    pdf.save(`Momentum_AI_Report_${user.name.replace(/\s/g, '_')}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-surface w-full max-w-2xl rounded-2xl border border-brand-secondary shadow-2xl flex flex-col animate-slide-in-up">
        <header className="p-6 border-b border-brand-secondary flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="clipboard-document" className="w-6 h-6" />
            {t('progressAnalysis.title')}
          </h2>
          <div className="flex items-center gap-2">
             <button
                onClick={handleExportToPDF}
                className="flex items-center gap-1.5 text-brand-text-muted font-semibold text-sm hover:text-white py-2 px-3 rounded-full hover:bg-brand-secondary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('progressAnalysis.exportTitle')}
                disabled={isLoading || !report}
              >
              <Icon name="arrow-down-tray" className="w-5 h-5" />
              <span>{t('progressAnalysis.exportButton')}</span>
            </button>
            <button onClick={onClose} className="text-brand-text-muted hover:text-white p-1 rounded-full text-2xl w-8 h-8 flex items-center justify-center">&times;</button>
          </div>
        </header>

        <div className="overflow-y-auto max-h-[70vh]">
            <div ref={reportContentRef} className="p-6 md:p-8 text-brand-text-muted">
                {isLoading && (
                    <div className="text-center text-brand-text-muted space-y-2 py-12">
                    <Icon name="sparkles" className="w-10 h-10 mx-auto animate-pulse mb-2 text-brand-primary" />
                    <p className="font-semibold">{t('progressAnalysis.loading')}</p>
                    </div>
                )}
                {!isLoading && report && (
                    <>
                    <div>
                        {renderStyledText(report)}
                    </div>
                    </>
                )}
                {!isLoading && !report && (
                    <div className="text-center text-brand-danger py-12">
                    <p>{t('progressAnalysis.error')}</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};