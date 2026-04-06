import { useState } from "react";
import { Code, ChevronRight, Copy, Check } from "lucide-react";

import type { ToolCallsProps } from "src/types/chat";


export default function ToolCalls({ 
  toolCall 
}: ToolCallsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copiedArgs, setCopiedArgs] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  const handleCopyArgs = (args: any) => {
    const text = JSON.stringify(args, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedArgs(true);
    setTimeout(() => setCopiedArgs(false), 1000);
  }

  const handleCopyResponse = (response: any) => {
    const text = JSON.stringify(response, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 1000);
  }

  return (
    <div className="obsidian-agent__tool-call__container">
        <div
          className={`obsidian-agent__tool-call${
            isOpen ? " obsidian-agent__tool-call-open" : ""
          }`}
        >
          <div
            className="obsidian-agent__tool-call__header obsidian-agent__tool-call__dropdown-header obsidian-agent__cursor-pointer"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <Code size={14} />
            <span className="obsidian-agent__tool-call__name">
              {toolCall.tool_name!.replace('_', ' ')}
            </span>
            <span
              className={`obsidian-agent__tool-call__dropdown-arrow obsidian-agent__margin-left-auto${
                isOpen ? " obsidian-agent__tool-call__dropdown-arrow-open" : ""
              }`}
            >
              <ChevronRight size={14} />
            </span>
          </div>

          {isOpen && (
            <div className="obsidian-agent__animate__tool-call-dropdown-content">
              {toolCall.tool_arguments && Object.keys(toolCall.tool_arguments).length > 0 && (
                <div className="obsidian-agent__tool-call__args">
                  <div className="obsidian-agent__tool-call__result-header">
                    Arguments:
                    <button
                      className="obsidian-agent__tool-call__copy-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyArgs(toolCall.tool_arguments);
                      }}
                      title="Copy arguments"
                    >
                      {copiedArgs ? (
                        <Check size={14} className="obsidian-agent__animate__copy-check-animate" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <pre className="obsidian-agent__tool-call__args-pre">
                    {JSON.stringify(toolCall.tool_arguments, null, 2)}
                  </pre>
                </div>
              )}

              {toolCall.tool_response && (Object.keys(toolCall.tool_response).length > 0) && (
                <div className="obsidian-agent__tool-call__args">
                  <div className="obsidian-agent__tool-call__result-header">
                    Response:
                    <button
                      className="obsidian-agent__tool-call__copy-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyResponse(toolCall.tool_response);
                      }}
                      title="Copy response"
                    >
                      {copiedResponse ? (
                        <Check size={14} className="obsidian-agent__animate__copy-check-animate" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <pre className="obsidian-agent__tool-call__result-pre">
                    {JSON.stringify(toolCall.tool_response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
}
