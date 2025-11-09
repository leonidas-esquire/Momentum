import React, { useState, useEffect, useContext, useRef } from 'react';
import { User, Habit } from '../types';
import { Icon } from './Icon';
import { generateProgressAnalysisReport } from '../services/geminiService';
import { LanguageContext } from '../contexts/LanguageContext';

declare const jspdf: any;

interface ProgressAnalysisModalProps {
  user: User;
  habits: Habit[];
  onClose: () => void;
}

// Helper function to render inline formatting like bold text for the on-screen display
const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-brand-text">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

// Renders the full text with styled headings, paragraphs, and lists for on-screen display
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

        if (line.trim() === '') {
            flushList();
            continue;
        }
        
        const isListItem = line.match(/^\s*(-|\*|\d+\.)\s/);

        if (isListItem) {
            currentListItems.push(
                <li key={i}>{renderInlineFormatting(line.replace(/^\s*(-|\*|\d+\.)\s/, ''))}</li>
            );
        } else {
            flushList();

            if (line.match(/^# /)) {
                elements.push(<h1 key={i} className="text-2xl font-bold mt-4 text-brand-text border-b-2 border-brand-secondary pb-2">{renderInlineFormatting(line.substring(2))}</h1>);
            } else if (line.match(/^## /)) {
                elements.push(<h2 key={i} className="text-xl font-bold mt-4 text-brand-text border-b border-brand-secondary/70 pb-1">{renderInlineFormatting(line.substring(3))}</h2>);
            } else if (line.match(/^### /)) {
                elements.push(<h3 key={i} className="text-lg font-bold mt-3 text-brand-primary">{renderInlineFormatting(line.substring(4))}</h3>);
            } else {
                elements.push(<p key={i} className="my-2">{renderInlineFormatting(line)}</p>);
            }
        }
    }
    
    flushList();

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
    const TEXT_COLOR = '#111827';
    const MUTED_COLOR = '#6B7280';
    const PAGE_MARGIN_X = 20;
    const PAGE_MARGIN_Y = 25;
    const HEADER_Y = 15;
    const MAX_WIDTH = pdfWidth - PAGE_MARGIN_X * 2;
    
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
    pdf.setTextColor(TEXT_COLOR);
    let y = PAGE_MARGIN_Y;

    const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pdfHeight - PAGE_MARGIN_Y) {
            pdf.addPage();
            y = PAGE_MARGIN_Y;
        }
    };
    
    type StyledSegment = { text: string; isBold: boolean };

    const renderBlock = (block: string) => {
        let fontSize = 11;
        let color = TEXT_COLOR;
        let text = block.trim();
        let isList = false;
        let leftMargin = PAGE_MARGIN_X;
        let spaceBefore = 4;
        let spaceAfter = 2;
        let hasLine = false;

        const headingMatch = text.match(/^(#+)\s(.*)/);
        const listMatch = text.match(/^\s*(-|\*|\d+\.)\s(.*)/);

        if (headingMatch) {
            const level = headingMatch[1].length;
            text = headingMatch[2];
            if (level === 1) { fontSize = 20; spaceBefore = 8; spaceAfter = 4; hasLine = true; }
            if (level === 2) { fontSize = 16; spaceBefore = 8; spaceAfter = 3; }
            if (level === 3) { fontSize = 12; color = BRAND_COLOR; spaceBefore = 6; spaceAfter = 2; }
        } else if (listMatch) {
            text = listMatch[2];
            isList = true;
            leftMargin += 5;
            spaceBefore = 1;
            spaceAfter = 1;
            fontSize = 10;
        }

        y += spaceBefore;
        checkPageBreak(fontSize * 0.35);

        pdf.setFontSize(fontSize);
        pdf.setTextColor(color);

        const buildLinesManually = (rawText: string, maxWidth: number): StyledSegment[][] => {
            const words: StyledSegment[] = [];
            const segments = rawText.split(/(\*\*.*?\*\*)/g).filter(Boolean);
            segments.forEach(seg => {
                const isBold = seg.startsWith('**') && seg.endsWith('**');
                const segText = isBold ? seg.slice(2, -2) : seg;
                segText.split(' ').forEach(word => {
                    if (word) words.push({ text: word, isBold });
                });
            });

            const finalLines: StyledSegment[][] = [];
            if (words.length === 0) return finalLines;

            let lineInProgress: StyledSegment[] = [];
            let currentLineWidth = 0;
            const spaceWidth = pdf.getStringUnitWidth(' ') * fontSize / pdf.internal.scaleFactor;

            words.forEach(word => {
                pdf.setFont('helvetica', word.isBold ? 'bold' : 'normal');
                const wordWidth = pdf.getStringUnitWidth(word.text) * fontSize / pdf.internal.scaleFactor;

                if (currentLineWidth + (lineInProgress.length > 0 ? spaceWidth : 0) + wordWidth > maxWidth) {
                    finalLines.push(lineInProgress);
                    lineInProgress = [word];
                    currentLineWidth = wordWidth;
                } else {
                    if (lineInProgress.length > 0) currentLineWidth += spaceWidth;
                    lineInProgress.push(word);
                    currentLineWidth += wordWidth;
                }
            });
            if (lineInProgress.length > 0) finalLines.push(lineInProgress);
            return finalLines;
        };

        const maxWidth = MAX_WIDTH - (isList ? 5 : 0);
        const finalLines = buildLinesManually(text, maxWidth);

        finalLines.forEach((lineSegments, lineIndex) => {
            const lineHeight = (pdf.getLineHeight(text) / pdf.internal.scaleFactor) * 0.9;
            checkPageBreak(lineHeight);
            
            let currentX = leftMargin;
            if (isList && lineIndex === 0) {
                pdf.setFillColor(TEXT_COLOR);
                pdf.circle(PAGE_MARGIN_X + 2.5, y - (lineHeight / 2) + 2, 0.8, 'F');
            }

            lineSegments.forEach((segment, segmentIndex) => {
                if (segmentIndex > 0) {
                    currentX += pdf.getStringUnitWidth(' ') * fontSize / pdf.internal.scaleFactor;
                }
                pdf.setFont('helvetica', segment.isBold ? 'bold' : 'normal');
                pdf.text(segment.text, currentX, y);
                currentX += pdf.getStringUnitWidth(segment.text) * fontSize / pdf.internal.scaleFactor;
            });
            y += lineHeight;
        });

        if (hasLine) {
            y += 1;
            checkPageBreak(2);
            pdf.setDrawColor(MUTED_COLOR);
            pdf.setLineWidth(0.2);
            pdf.line(PAGE_MARGIN_X, y, PAGE_MARGIN_X + MAX_WIDTH, y);
            y += 2;
        }

        y += spaceAfter;
    };

    const rawLines = report ? report.split(/\r?\n/) : [];
    const blocks: string[] = [];
    let currentParagraph = '';
    rawLines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed === '') {
            if (currentParagraph) blocks.push(currentParagraph);
            currentParagraph = '';
        } else if (trimmed.match(/^(#|##|###|\d\.|-|\*)/)) {
            if (currentParagraph) blocks.push(currentParagraph);
            currentParagraph = '';
            blocks.push(trimmed);
        } else {
            currentParagraph += (currentParagraph ? ' ' : '') + trimmed;
        }
    });
    if (currentParagraph) blocks.push(currentParagraph);

    blocks.forEach(renderBlock);

    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(MUTED_COLOR);
        pdf.text("Momentum AI Progress Report", PAGE_MARGIN_X, HEADER_Y);
        pdf.text(`Page ${i - 1} of ${totalPages - 1}`, pdfWidth - PAGE_MARGIN_X, HEADER_Y, { align: 'right' });
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
