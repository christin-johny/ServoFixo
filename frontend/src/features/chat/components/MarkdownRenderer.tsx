import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

interface Props {
    content: string;
    isUser: boolean;
}

const MarkdownRenderer: React.FC<Props> = ({ content, isUser }) => {
    const navigate = useNavigate();

    return (
        <ReactMarkdown
            components={{
                a: ({ ...props }) => {
                    const handleClick = () => {
                        // Strictly redirect to the main services page
                        navigate('/services'); 
                    };

                    return (
                        <button
                            onClick={handleClick}
                            className={`inline-flex items-center px-4 py-2 my-2 rounded-xl border font-bold text-xs transition-all shadow-sm ${
                                isUser 
                                    ? 'bg-white/20 border-white/30 text-white hover:bg-white/40' 
                                    : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {props.children}
                        </button>
                    );
                },
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <span className="font-bold text-blue-700">{children}</span>
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownRenderer;