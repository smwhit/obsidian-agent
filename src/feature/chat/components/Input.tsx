import { useState, useEffect, useRef } from "react";
import { AtSign, X, CornerDownLeft, ChevronDown, Image } from "lucide-react";
import { TFile } from "obsidian";

import { getApp, getPlugin, getSettings } from "src/main";
import { handleCall } from "src/feature/chat/handlers/aiHandlers";
import { AddContextModal } from "src/feature/modals/AddContextModal";
import { ChooseModelModal } from "src/feature/modals/ChooseModelModal";
import { InputProps } from "src/types/chat";
import { AgentSettings } from "src/settings/settings";


export default function ChatInput({
  activeChat,
  initialValue = "",
  attachments = [],
  messageIndex,
  isRegeneration = false,
  setIsEditing,
  conversation,
  setConversation,
}: InputProps) {
  const settings = getSettings();
  const apiKey = settings.googleApiKey?.trim();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<string>(initialValue);
  const canSend = message.trim() && activeChat && apiKey;

  const [selectedModel, setSelectedModel] = useState<string>(getSettings().model);
  const [selectedNotes, setSelectedNotes] = useState<string[]>(attachments);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  useEffect(() => {
    const plugin = getPlugin();
  
    const handleSettingsUpdate = (newSettings: AgentSettings) => {
      setSelectedModel(newSettings.model);
    };
  
    plugin.settingsEmitter.on("settings-updated", handleSettingsUpdate);
  
    // Cleanup
    return () => {
      plugin.settingsEmitter.off("settings-updated", handleSettingsUpdate);
    };
  }, []);

  // Disable or not the button
  const getButtonTitle = () => {
    if (!apiKey) return "Set an API key";
    if (!message.trim()) return "Write something";
    return "Send message";
  };

  // Hanlder to send message
  const handleSendWithState = async () => {
    setMessage("");
    
    if (isRegeneration && setIsEditing) {
      setIsEditing(false);
    }

    await handleCall({
      activeChat,
      conversation,
      message,
      messageIndex,
      files: selectedFiles,
      attachments: selectedNotes,
      isRegeneration,
      setConversation,
  })
  }

  // Open the AddContextModal
  const openNotePicker = () => {
    const app = getApp();
    new AddContextModal(
      app, 
      (note: TFile) => {
        setSelectedNotes((prev) => {
          // If no previous notes, create new array with the note
          if (!prev) return [note.path];
          // Check if note already exists in the list
          const noteExists = prev.some((existingNote) => existingNote === note.path);
          if (noteExists) return prev;
          // Add new note to existing array
          return [...prev, note.path];
        });
      }
    ).open();
  }
  // Removes a note from the selected notes
  const removeNote = (toRemove: string) => {
    setSelectedNotes((prev) => {
      if (!prev) return [];
      
      const filteredNotes = prev.filter((note) => note !== toRemove);
      return filteredNotes;
    });
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newfiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newfiles]);
    }
    // Reset the input value so the same image can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  // Remove a image from the selected files
  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="obsidian-agent__input__container">
      {(isRegeneration && setIsEditing) && (
        <button onClick={() => setIsEditing(false)} className="obsidian-agent__button-icon obsidian-agent__button-exit-editing">
          <X size={16}/>
        </button>
      )}

      <div className="obsidian-agent__input__context-container">
        {/* Button to add context */}
        <button 
          title="Add context"
          onClick={openNotePicker} 
          className="obsidian-agent__input__add-context-button"
        >
          <AtSign size={14} />
        </button>
        
        {/* Show selected notes and images */}
        {selectedNotes.map((note) => (
          <div key={note} className="obsidian-agent__input__attachment-tag">
            <span className="obsidian-agent__input__attachment-text">{note.split("/").pop()?.replace(".md", "")}</span>
            <button 
              onClick={() => removeNote(note)} 
              className="obsidian-agent__input__remove-attachment-button"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {selectedFiles.map((img, index) => {
          const previewUrl = URL.createObjectURL(img);
          return (
            <div key={index} className="obsidian-agent__input__attachment-tag">
              <img src={previewUrl!} alt={img.name} className="obsidian-agent__input__attachment-image"/>
              <span className="obsidian-agent__input__attachment-text">{img.name}</span>
              <button 
                onClick={() => removeImage(index)} 
                className="obsidian-agent__button-icon obsidian-agent__width-auto"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="obsidian-agent__input__textarea-container">
        <textarea
          placeholder="Send a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendWithState();
            }
          }}
          className="obsidian-agent__input__textarea"
        />
      </div>

      <div className="obsidian-agent__input__actions">
        <button 
          onClick={() => new ChooseModelModal().open()} 
          className="obsidian-agent__input__select-model-button"
        >
          <ChevronDown size={14}/>
          {selectedModel}
        </button>
        
        <div className="obsidian-agent__input__right-actions">
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="obsidian-agent__input__attach-image-button"
              title="Attach an image"
            >
              <Image size={18} />
            </button>
            <input
              className="obsidian-agent__display-none"
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png"
              multiple
            >
            </input>
          </div>
          <button
            className="obsidian-agent__input__submit_button"
            onClick={handleSendWithState}
            title={getButtonTitle()}
            disabled={!canSend}
          >
            submit
            <CornerDownLeft size={14} />
          </button>
        </div>
      </div>
    </div> 
  );
}