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
    if (!report) return;

    const { jsPDF } = jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // --- PDF Styling Constants ---
    const BRAND_COLOR = '#8A42D6';
    const TEXT_COLOR = '#111827'; // Black for white bg
    const MUTED_COLOR = '#6B7280'; // Gray text
    const PAGE_MARGIN_X = 20;
    const PAGE_MARGIN_Y = 25;
    const MAX_WIDTH = pdfWidth - PAGE_MARGIN_X * 2;
    const LINE_HEIGHT_MULTIPLIER = 1.4;
    const HEADER_Y = 15;
    const FOOTER_Y = 15;

    // --- Cover Page ---
    pdf.setFillColor(BRAND_COLOR);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(40);
    pdf.setTextColor('#FFFFFF');
    pdf.text("Momentum", pdfWidth / 2, 80, { align: 'center' });
    
    pdf.setFontSize(20);
    pdf.setTextColor('#E4E4E6');
    pdf.text("AI-Powered Progress Report", pdfWidth / 2, 100, { align: 'center' });
    
    pdf.setDrawColor('#FFFFFF');
    pdf.setLineWidth(0.5);
    pdf.line(PAGE_MARGIN_X, 130, pdfWidth - PAGE_MARGIN_X, 130);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor('#A0A0B0');
    pdf.text("Prepared for:", PAGE_MARGIN_X, 150);
    
    pdf.setFontSize(18);
    pdf.setTextColor('#FFFFFF');
    pdf.text(user.name, PAGE_MARGIN_X, 160);
    
    pdf.setFontSize(12);
    pdf.setTextColor('#A0A0B0');
    pdf.text(`Report Generated: ${new Date().toLocaleDateString()}`, PAGE_MARGIN_X, pdfHeight - 30);
    
    // --- Report Content ---
    pdf.addPage();
    let y = PAGE_MARGIN_Y;

    const addHeaderAndFooter = (pageNum: number) => {
        pdf.setFontSize(9);
        pdf.setTextColor(MUTED_COLOR);
        pdf.text("Momentum: The Irresistible Habit App", PAGE_MARGIN_X, HEADER_Y);
        pdf.text("Your Momentum App - Progress Report", PAGE_MARGIN_X, pdfHeight - FOOTER_Y);
        // Page number will be finalized later
    };
    addHeaderAndFooter(2);

    const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pdfHeight - PAGE_MARGIN_Y) {
            pdf.addPage();
            y = PAGE_MARGIN_Y;
            addHeaderAndFooter(pdf.internal.getNumberOfPages());
        }
    };

    const lines = report ? report.split('\n') : [];
    for (const line of lines) {
        if (line.trim() === '') {
            y += 5; // Paragraph break
            checkPageBreak(0);
            continue;
        }

        let fontSize = 11;
        let fontStyle = 'normal';
        let color = TEXT_COLOR;
        let text = line;
        let isList = false;
        let leftMargin = PAGE_MARGIN_X;
        let spaceBefore = 2;
        
        // Simple Markdown parsing
        if (line.match(/^# /)) {
            fontSize = 22; fontStyle = 'bold'; text = line.substring(2); spaceBefore = 10;
        } else if (line.match(/^## /)) {
            fontSize = 16; fontStyle = 'bold'; text = line.substring(3); spaceBefore = 8;
        } else if (line.match(/^### /) || line.match(/^\d\.\s/)) {
            fontSize = 12; fontStyle = 'bold'; color = BRAND_COLOR;
            text = line.startsWith('###') ? line.substring(4) : line.substring(line.indexOf(' ') + 1);
            spaceBefore = 6;
        } else if (line.startsWith('* ') || line.startsWith('- ')) {
            text = line.substring(2); isList = true; leftMargin += 5; spaceBefore = 1;
        }

        y += spaceBefore;
        checkPageBreak(0);

        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        pdf.setTextColor(color);
        
        // Handle inline bolding by splitting and measuring
        const processAndWrapText = (rawText: string, maxWidth: number) => {
            const parts = rawText.split(/(\*\*.*?\*\*)/g).filter(p => p);
            const words: {text: string, isBold: boolean}[] = [];
            parts.forEach(part => {
                const isBold = part.startsWith('**');
                part.replace(/\*\*/g, '').split(' ').forEach(word => {
                    if(word) words.push({ text: word, isBold });
                });
            });

            const lines: { words: {text: string, isBold: boolean}[] }[] = [];
            let currentLine: { words: {text: string, isBold: boolean}[] } = { words: [] };
            
            words.forEach(word => {
                const currentLineText = [...currentLine.words, word].map(w => w.text).join(' ');
                const width = pdf.getStringUnitWidth(currentLineText) * fontSize / pdf.internal.scaleFactor;
                if(width > maxWidth) {
                    lines.push(currentLine);
                    currentLine = { words: [word] };
                } else {
                    currentLine.words.push(word);
                }
            });
            lines.push(currentLine);
            return lines;
        }

        const wrappedLines = processAndWrapText(text, MAX_WIDTH - (isList ? 5 : 0));
        const neededHeight = wrappedLines.length * fontSize * 0.352777 * LINE_HEIGHT_MULTIPLIER;
        checkPageBreak(neededHeight);

        if (isList) {
            pdf.setFillColor(TEXT_COLOR);
            pdf.circle(PAGE_MARGIN_X + 2, y, 0.8, 'F');
        }

        wrappedLines.forEach((lineData, index) => {
            let currentX = leftMargin;
            lineData.words.forEach(word => {
                pdf.setFont('helvetica', word.isBold ? 'bold' : 'normal');
                pdf.text(word.text + ' ', currentX, y);
                currentX += pdf.getStringUnitWidth(word.text + ' ') * fontSize / pdf.internal.scaleFactor;
            });
            y += fontSize * 0.352777 * LINE_HEIGHT_MULTIPLIER;
            checkPageBreak(0);
        });

    }

    // Finalize page numbers
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.text(`Page ${i} of ${totalPages}`, pdfWidth - PAGE_MARGIN_X, pdfHeight - FOOTER_Y, { align: 'right' });
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