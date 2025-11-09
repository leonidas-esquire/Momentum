import React from 'react';
import { Icon } from './Icon';
import { PLAYBOOK_MARKDOWN } from '../content/playbook';

declare const jspdf: any;

interface PlaybookModalProps {
  onClose: () => void;
}

// Helper function to render inline formatting for on-screen display
const renderInlineFormatting = (text: string) => {
    // Replace emojis with text for display consistency
    const cleanText = text
      .replace(/🔥/g, '(Streak)')
      .replace(/🛡️/g, '(Shield)')
      .replace(/📉/g, '(Missed)')
      .replace(/⭐/g, '(Favorite)')
      .replace(/✅/g, '(Complete)')
      .replace(/✏️/g, '(Edit)')
      .replace(/🗑️/g, '(Delete)')
      .replace(/🎤/g, '(Voice Note)')
      .replace(/🤝/g, '(Momentum)')
      .replace(/🏆/g, '(Quest)')
      .replace(/⚔️/g, '(Saga)')
      .replace(/💬/g, '(Chat)');

    const parts = cleanText.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-brand-text">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="bg-brand-bg text-brand-primary font-mono text-sm px-1 py-0.5 rounded">{part.slice(1, -1)}</code>
        }
        return part;
    });
};

// Renders the full text with styled headings, paragraphs, and lists for on-screen display
const renderStyledText = (markdownText: string) => {
    const lines = markdownText.trim().split('\n');
    const elements: React.ReactNode[] = [];
    let currentListItems: React.ReactNode[] = [];

    const flushList = () => {
        if (currentListItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-2 my-3 pl-2">
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
        const isBlockquote = line.startsWith('> ');

        if (isListItem) {
            currentListItems.push(
                <li key={i} className="pl-2">{renderInlineFormatting(line.replace(/^\s*(-|\*|\d+\.)\s/, ''))}</li>
            );
        } else {
            flushList();

            if (line.startsWith('# ')) {
                elements.push(<h1 key={i} className="text-3xl font-bold mt-6 mb-3 text-brand-text border-b-2 border-brand-secondary pb-2">{renderInlineFormatting(line.substring(2))}</h1>);
            } else if (line.startsWith('## ')) {
                elements.push(<h2 key={i} className="text-2xl font-bold mt-5 mb-2 text-brand-text">{renderInlineFormatting(line.substring(3))}</h2>);
            } else if (line.startsWith('### ')) {
                elements.push(<h3 key={i} className="text-xl font-bold mt-4 mb-2 text-brand-primary">{renderInlineFormatting(line.substring(4))}</h3>);
            } else if (line.startsWith('#### ')) {
                elements.push(<h4 key={i} className="text-lg font-semibold mt-3 mb-1 text-brand-text">{renderInlineFormatting(line.substring(5))}</h4>);
            } else if (isBlockquote) {
                elements.push(<blockquote key={i} className="border-l-4 border-brand-primary/50 bg-brand-bg pl-4 py-2 my-3 italic">{renderInlineFormatting(line.substring(2))}</blockquote>)
            } else {
                elements.push(<p key={i} className="my-2">{renderInlineFormatting(line)}</p>);
            }
        }
    }
    
    flushList(); // Make sure to render any list at the end

    return elements;
};

export const PlaybookModal: React.FC<PlaybookModalProps> = ({ onClose }) => {

    const handleExportToPDF = async () => {
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
        pdf.text("Momentum", pdfWidth / 2, 100, { align: 'center' });
        pdf.setFontSize(24);
        pdf.setTextColor('#E4E4E6');
        pdf.text("The Ultimate Playbook", pdfWidth / 2, 120, { align: 'center' });
        pdf.setDrawColor('#FFFFFF');
        pdf.setLineWidth(0.5);
        pdf.line(PAGE_MARGIN_X, 150, pdfWidth - PAGE_MARGIN_X, 150);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        pdf.setTextColor('#A0A0B0');
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, PAGE_MARGIN_X, pdfHeight - 30);
        
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
        
        const renderBlock = (block: string) => {
            let fontSize = 10;
            let color = TEXT_COLOR;
            let text = block.trim()
                .replace(/🔥|🛡️|📉|⭐|✅|✏️|🗑️|🎤|🤝|🏆|⚔️|💬/g, '') // Remove emojis for PDF
                .replace(/`/g, ''); // Remove backticks

            let leftMargin = PAGE_MARGIN_X;
            let spaceBefore = 2;
            let spaceAfter = 1;
            let isList = false;
            let isBlockquote = false;

            pdf.setFont('helvetica', 'normal');

            if (text.startsWith('# ')) { fontSize = 22; pdf.setFont('helvetica', 'bold'); text = text.substring(2); spaceBefore = 8; spaceAfter = 4; }
            else if (text.startsWith('## ')) { fontSize = 18; pdf.setFont('helvetica', 'bold'); text = text.substring(3); spaceBefore = 6; spaceAfter = 3; }
            else if (text.startsWith('### ')) { fontSize = 14; pdf.setFont('helvetica', 'bold'); text = text.substring(4); spaceBefore = 5; spaceAfter = 2; color = BRAND_COLOR;}
            else if (text.startsWith('#### ')) { fontSize = 12; pdf.setFont('helvetica', 'bold'); text = text.substring(5); spaceBefore = 4; spaceAfter = 2; }
            else if (text.startsWith('> ')) { isBlockquote = true; text = text.substring(2); color = MUTED_COLOR; pdf.setFont('helvetica', 'italic'); leftMargin += 5; spaceBefore = 3; spaceAfter = 3;}
            else if (text.match(/^\s*(-|\*|\d+\.)\s/)) { isList = true; text = text.replace(/^\s*(-|\*|\d+\.)\s/, ''); leftMargin += 5; spaceBefore = 1; spaceAfter = 1; }

            y += spaceBefore;
            checkPageBreak(fontSize * 0.35);

            pdf.setTextColor(color);
            pdf.setFontSize(fontSize);

            const maxWidth = MAX_WIDTH - (leftMargin - PAGE_MARGIN_X);

            const segments = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);
            const words: { text: string; isBold: boolean }[] = [];
            segments.forEach(seg => {
                const isBold = seg.startsWith('**') && seg.endsWith('**');
                const segText = isBold ? seg.slice(2, -2) : seg;
                segText.split(' ').forEach(word => {
                    if (word) words.push({ text: word, isBold });
                });
            });

            const lines: { text: string; isBold: boolean }[][] = [];
            let currentLine: { text: string; isBold: boolean }[] = [];
            let currentLineWidth = 0;
            const spaceWidth = pdf.getStringUnitWidth(' ') * fontSize / pdf.internal.scaleFactor;

            words.forEach(word => {
                pdf.setFont('helvetica', word.isBold ? 'bold' : 'normal');
                const wordWidth = pdf.getStringUnitWidth(word.text) * fontSize / pdf.internal.scaleFactor;
                if (currentLineWidth + (currentLine.length > 0 ? spaceWidth : 0) + wordWidth > maxWidth) {
                    lines.push(currentLine);
                    currentLine = [word];
                    currentLineWidth = wordWidth;
                } else {
                    currentLineWidth += (currentLine.length > 0 ? spaceWidth : 0) + wordWidth;
                    currentLine.push(word);
                }
            });
            if (currentLine.length > 0) lines.push(currentLine);

            const lineHeight = (pdf.getLineHeight(text) / pdf.internal.scaleFactor) * 0.9;
            if (isBlockquote) {
                const quoteHeight = lines.length * lineHeight + 2;
                checkPageBreak(quoteHeight);
                pdf.setFillColor(BRAND_COLOR);
                pdf.rect(PAGE_MARGIN_X, y - 2, 1.5, quoteHeight, 'F');
            }

            lines.forEach((line, index) => {
                checkPageBreak(lineHeight);
                let currentX = leftMargin;
                if (isList && index === 0) {
                    pdf.setFillColor(TEXT_COLOR);
                    pdf.circle(PAGE_MARGIN_X + 2.5, y, 0.8, 'F');
                }
                
                line.forEach((segment, segIndex) => {
                    pdf.setFont('helvetica', segment.isBold ? 'bold' : 'normal');
                    pdf.text(segment.text, currentX, y);
                    currentX += pdf.getStringUnitWidth(segment.text) * fontSize / pdf.internal.scaleFactor + spaceWidth;
                });
                y += lineHeight;
            });

            y += spaceAfter;
        };

        const blocks = PLAYBOOK_MARKDOWN.split(/\n\s*\n/);
        blocks.forEach(block => {
            if (block.trim()) renderBlock(block);
        });
        
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 2; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(9);
            pdf.setTextColor(MUTED_COLOR);
            pdf.text("Momentum Playbook", PAGE_MARGIN_X, HEADER_Y);
            pdf.text(`Page ${i - 1} of ${totalPages - 1}`, pdfWidth - PAGE_MARGIN_X, HEADER_Y, { align: 'right' });
        }

        pdf.save(`Momentum_Playbook.pdf`);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
          <div className="bg-brand-surface w-full max-w-3xl h-[90vh] rounded-2xl border border-brand-secondary shadow-2xl flex flex-col animate-slide-in-up">
            <header className="p-4 sm:p-6 border-b border-brand-secondary flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Icon name="book-open" className="w-6 h-6" />
                Momentum App Playbook
              </h2>
              <div className="flex items-center gap-2">
                 <button
                    onClick={handleExportToPDF}
                    className="flex items-center gap-1.5 text-brand-text-muted font-semibold text-sm hover:text-white py-2 px-3 rounded-full hover:bg-brand-secondary/20 transition-colors"
                    title="Export to PDF"
                  >
                  <Icon name="arrow-down-tray" className="w-5 h-5" />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>
                <button onClick={onClose} className="text-brand-text-muted hover:text-white p-1 rounded-full text-2xl w-8 h-8 flex items-center justify-center">&times;</button>
              </div>
            </header>
    
            <div className="overflow-y-auto flex-grow">
                <div className="p-6 md:p-8 text-brand-text-muted">
                    {renderStyledText(PLAYBOOK_MARKDOWN)}
                </div>
            </div>
          </div>
        </div>
      );
};
