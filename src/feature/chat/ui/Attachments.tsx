import type { AttachmentsProps } from "src/types/chat"

export default function Attachments({
  attachments
}: AttachmentsProps) {
  return (
    <div className="obsidian-agent__input__context-row">
      {attachments.map((attachment, index) => (
        <div key={attachment} className="obsidian-agent__input__attachment-tag">
          <p className="obsidian-agent__input__attachment-text">{attachment.split("/").pop()?.replace(".md", "")}</p>
        </div>
      ))}
    </div>    
  )
}