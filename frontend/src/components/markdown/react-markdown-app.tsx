import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkBreaks from "remark-breaks";
import "@/components/markdown/github-markdown.css";
import "@/components/markdown/small-header-markdown.css";

export default function ReactMarkdownApp({ children }: { children?: string }) {
  return (
    <div className="markdown-body new-york-small">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkParse, remarkBreaks]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
