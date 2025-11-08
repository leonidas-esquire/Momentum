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

// Helper function to render inline formatting like bold text
const renderInlineFormatting = (text: string) => {
    // Split by bold tags, keeping the tags to process them
    const parts = text.split(/(\*\*.*?\*\*)/g); 
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-brand-text">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

// Renders the full text with styled headings, paragraphs, and lists
const renderStyledText = (markdownText: string) => {
    const lines = markdownText.split('\n');
    return lines.map((line, index) => {
        if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-bold mt-4 border-b-2 border-brand-primary pb-2">{line.substring(2)}</h1>;
        if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold mt-4 border-b border-brand-secondary pb-1">{line.substring(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-bold mt-3 text-brand-primary">{line.substring(4)}</h3>;
        if (line.startsWith('* ') || line.startsWith('- ')) return <li key={index} className="ml-5 list-disc">{renderInlineFormatting(line.substring(2))}</li>;
        if (line.trim() === '') return <br key={index} />;
        return <p key={index} className="my-2">{renderInlineFormatting(line)}</p>;
    });
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

    // Get computed background color from the parent to handle CSS variables correctly
    const backgroundColor = window.getComputedStyle(content.parentElement).getPropertyValue('background-color');

    const canvas = await html2canvas(content, { 
        scale: 2, // Higher scale for better quality
        backgroundColor: backgroundColor || '#1B1B1F', // Fallback for safety
    });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    
    const imgProps= pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth - 20; // A4 width in mm with some margin
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 10; // Top margin

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pdf.internal.pageSize.getHeight() - 20);

    while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdf.internal.pageSize.getHeight() - 20);
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
            <button onClick={onClose} className="text-brand-text-muted hover:text-white text-2xl font-light">&times;</button>
          </div>
        </header>

        <main ref={reportContentRef} className="p-6 md:p-8 text-brand-text-muted overflow-y-auto max-h-[70vh]">
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
              <div className="mt-8 pt-4 border-t border-brand-secondary/50 text-xs text-brand-text-muted italic">
                <p>{t('progressAnalysis.formattingNote')}</p>
              </div>
            </>
          )}
           {!isLoading && !report && (
            <div className="text-center text-brand-danger py-12">
              <p>{t('progressAnalysis.error')}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};