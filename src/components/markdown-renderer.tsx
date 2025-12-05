import React from 'react';

type MarkdownRendererProps = {
  content: string;
  boldColorClass: string;
};

export function MarkdownRenderer({ content, boldColorClass }: MarkdownRendererProps) {
  const parts = content.split(/(\*\*.*?\*\*)/g);

  return (
    <div>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className={boldColorClass}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <React.Fragment key={index}>{part.replace(/\n/g, ' ')}</React.Fragment>;
      })}
    </div>
  );
}
