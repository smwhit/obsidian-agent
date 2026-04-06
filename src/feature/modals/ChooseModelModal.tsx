import { useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { Modal } from 'obsidian';

import { getApp, getSettings } from 'src/main';
import { allAvailableModels } from 'src/settings/models';

import type { Provider, Model } from 'src/types/ai';


function ChooseModel() {
  const settings = getSettings();

  const providers = Object.keys(allAvailableModels);
  const [provider, setProvider] = useState<Provider>(settings.provider as Provider);

  const models: Model[] = allAvailableModels[provider] || []
  const [model, setModel] = useState<string>(settings.model);

  const handleSaveModel = (e: React.FormEvent) => {
    e.preventDefault();

    settings.provider = provider;
    settings.model = model;
  };

  return (
    <div>
      <form onSubmit={handleSaveModel} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Provider dropdown */}
        <label htmlFor="provider">Provider</label>
        <select 
          value={provider} 
          onChange={(e) => {
            const newProvider = e.target.value as Provider;
            setProvider(newProvider);
          
            const newModels = allAvailableModels[newProvider];
            setModel(newModels[0].name);
          }}
        >
          {providers.map((provider) => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>

        {/* Model dropdown */}
        <label htmlFor="model">Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value) }
        >
          {models.map((model) => (
            <option key={model.name} value={model.name}>
              {model.name}
            </option>
          ))}
        </select>
        
        <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
          <button type="submit" style={{ maxWidth: "100px", width: "100%" }}>Save</button>
        </div>
      </form>
    </div>
  )
}

export class ChooseModelModal extends Modal {
  private root: Root | undefined;

  constructor() {
    const app = getApp();

    super(app);
    this.setTitle("Select model");
  }

  onOpen(): Promise<void> | void {
    const { contentEl } = this;
    
    contentEl.empty();
    const container = contentEl.createDiv();
    this.root = createRoot(container);

    this.modalEl.style.width = '50%';
    this.modalEl.style.maxWidth = '600px';
    this.modalEl.style.height = '30%';
    this.modalEl.style.maxHeight = '300px';

    this.root.render(
      <ChooseModel/>
    )
  }

  onClose(): void {
    this.root?.unmount();
  }
}