"use client";

import { useRef, useState, useEffect, useMemo, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CodeLanguage =
  | "html"
  | "ruby"
  | "plaintext"
  | "bash"
  | "c"
  | "cpp"
  | "css"
  | "diff"
  | "dockerfile"
  | "go"
  | "graphql"
  | "java"
  | "javascript"
  | "json"
  | "jsx"
  | "kotlin"
  | "markdown"
  | "php"
  | "python"
  | "rust"
  | "shell"
  | "sql"
  | "toml"
  | "typescript"
  | "tsx"
  | "yaml";

type CodeBlockProps = {
  language?: CodeLanguage;
  code?: string;
  children?: ReactNode;
  className?: string;
  /**
   * When true + `summary` is provided, wraps the whole component in a
   * <details>/<summary> block (foldable/collapsible).
   */
  foldable?: boolean;
  summary?: string;
};

function stripSingleEdgeBlankLines(value: string) {
  let lines = value.replaceAll("\r\n", "\n").split("\n");
  if (lines.length > 0 && lines[0].trim() === "") lines = lines.slice(1);
  if (lines.length > 0 && lines[lines.length - 1].trim() === "")
    lines = lines.slice(0, -1);
  return lines;
}

function countLeadingWhitespace(line: string) {
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch !== " " && ch !== "\t") break;
    i += 1;
  }
  return i;
}

function dedentLines(lines: string[]) {
  let minIndent = Number.POSITIVE_INFINITY;
  for (const line of lines) {
    if (line.trim() === "") continue;
    minIndent = Math.min(minIndent, countLeadingWhitespace(line));
  }

  if (!Number.isFinite(minIndent) || minIndent <= 0) return lines;
  return lines.map((line) => (line.trim() === "" ? "" : line.slice(minIndent)));
}

function normalizeCode(value: string) {
  const lines = stripSingleEdgeBlankLines(value);
  return dedentLines(lines).join("\n");
}

async function copyToClipboard(text: string) {
  // Modern API
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (err) {
      console.error("Error copying text to clipboard using navigator.", err);
    }
  }
  // Fallback for older browsers if modern API fails
  if (typeof document === "undefined") return;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";

  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
  } catch (err) {
    console.error("Fallback copy failed", err);
  }

  document.body.removeChild(textarea);
}

function nodeToString(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToString).join("");
  return "";
}

function extractCodeFromPre(pre: HTMLPreElement): string {
  const lineNodes = pre.querySelectorAll("span.line");
  if (lineNodes.length > 0) {
    return Array.from(lineNodes, (line) => line.textContent ?? "").join("\n");
  }

  const codeEl = pre.querySelector("code");
  return codeEl?.textContent ?? pre.textContent ?? "";
}

export function CodeBlock({
  language,
  code: codeProp,
  children,
  className,
  foldable,
  summary,
}: CodeBlockProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const [wrappedLanguage, setWrappedLanguage] = useState<string>("");
  const rawFromPropsOrChildren = codeProp ?? nodeToString(children);
  const isWrapMode = !codeProp && rawFromPropsOrChildren.trim() === "";
  const shouldFold =
    Boolean(foldable) &&
    typeof summary === "string" &&
    summary.trim().length > 0;
  const code = useMemo(() => {
    if (isWrapMode) return "";
    return normalizeCode(rawFromPropsOrChildren);
  }, [isWrapMode, rawFromPropsOrChildren]);

  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isWrapMode) return;
    if (language) return;
    const pre = wrapperRef.current?.querySelector("pre");
    const detected = pre?.getAttribute("data-language") ?? "";
    setWrappedLanguage(detected);
  }, [isWrapMode, language]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  async function onCopy() {
    const textToCopy = (() => {
      if (codeProp) return normalizeCode(codeProp);
      if (!isWrapMode) return code;
      const pre = wrapperRef.current?.querySelector("pre");
      if (!pre) return "";
      return extractCodeFromPre(pre);
    })();

    if (!textToCopy) return;
    await copyToClipboard(textToCopy);
    setCopied(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
  }

  function onClickHandler() {
    summaryRef.current?.classList.toggle("rounded-b-none");
  }

  const displayLanguage =
    language ?? (wrappedLanguage as CodeLanguage | "") ?? "";

  const component = (
    <div
      ref={wrapperRef}
      className={cn(
        shouldFold
          ? "overflow-hidden border border-border border-t-0"
          : "my-4 overflow-hidden rounded-lg border border-border",
        // Make wrapped <pre> look like it's part of this component.
        "[&_pre]:m-0 [&_pre]:rounded-none",
        className,
      )}
    >
      <div className="flex select-none items-center justify-between gap-2 border-b border-border px-4 py-2">
        <div className="text-xs font-medium text-muted-foreground">
          {displayLanguage}
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs select-none"
          onClick={onCopy}
          disabled={isWrapMode ? false : !code}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      {isWrapMode ? (
        <div>{children}</div>
      ) : (
        <pre className="overflow-x-auto bg-muted px-4 py-3">
          <code className={language ? `language-${language}` : undefined}>
            {code}
          </code>
        </pre>
      )}
    </div>
  );

  if (!shouldFold) return component;

  return (
    <details className="my-4 border-none rounded-none">
      <summary
        ref={summaryRef}
        onClick={onClickHandler}
        className="cursor-pointer select-none rounded-md border border-border bg-muted/60 px-3 py-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {summary}
      </summary>
      {component}
    </details>
  );
}
