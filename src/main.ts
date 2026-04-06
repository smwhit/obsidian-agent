import EventEmitter from 'events';
import { Plugin, App, WorkspaceLeaf } from 'obsidian';

import { ChooseModelModal } from 'src/feature/modals/ChooseModelModal';
import { registerEditorMenuItems } from 'src/feature/menu/editorMenu';
import { ChatView, VIEW_TYPE_AGENT } from "src/feature/chat/View";
import { AgentSettingsTab } from "src/settings/SettingsTab";
import { AgentSettings, DEFAULT_SETTINGS } from './settings/settings';

// Global variable to access the plugin from any file
let pluginInstance: ObsidianAgentPlugin;

// Main plugin class
export default class ObsidianAgentPlugin extends Plugin {
  settings!: AgentSettings;
  settingsEmitter = new EventEmitter();

  // Method that loads the plugin
  async onload() {
    pluginInstance = this;

    // Add settings tab
    await this.loadSettings();
    this.addSettingTab(new AgentSettingsTab(this.app, this));

    // Add agent chat view
    this.registerView(VIEW_TYPE_AGENT, (leaf) => new ChatView(leaf, this));

    // Add sidebar ribon icon that shows the view
    this.addRibbonIcon('brain-cog', 'Chat with Agent', () => {
      this.activateAgentChatView();
    });

  //   // Hotkeys
  //   this.addCommand({
  //     id: "switch-model",
  //     name: "Switch model",
  //     callback: () => {
  //       const app = getApp();
  //       const plugin = getPlugin();
  //       const settings = getSettings();
        
  //       new ChooseModelModal().open();
  //     },
  //   });
  
  //   this.addCommand({
  //     id: "toggle-agent-sidebar",
  //     name: "Toggle agent sidebar",
  //     callback: () => {
  //       this.toggleAgentSidebar();
  //     }
  //   });

  //   // Menu Items (Actions when right click on a markdown view)
  //   registerEditorMenuItems(this);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.settingsEmitter.emit("settings-updated", this.settings);
  }
  
  // Toggle agent sidebar: if open, close it; if closed, open it
  async toggleAgentSidebar(): Promise<void> {
    const rightSplit = this.app.workspace.rightSplit;
    if (rightSplit && !rightSplit.collapsed) {
      rightSplit.collapse();
    } else {
      await this.activateAgentChatView();
    }
  }

  // Method that opens the agent chat view
  async activateAgentChatView(): Promise<void> {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = null;

    const existingLeaves = workspace.getLeavesOfType(VIEW_TYPE_AGENT);
    if (existingLeaves.length === 1) {
      leaf = existingLeaves[0];
    } else {
      if (existingLeaves.length >= 1) {
        workspace.detachLeavesOfType(VIEW_TYPE_AGENT);
      }
      
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: VIEW_TYPE_AGENT, active: true });
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  async onunload() {}
}


// Helpers to accesss App, Settings and Plugin from any file
// Returns the App
export function getApp(): App {
  if(!pluginInstance) throw new Error("Plugin instance not set yet");
  return pluginInstance.app;
}

// Returns the Plugin instance
export function getPlugin(): ObsidianAgentPlugin {
  if (!pluginInstance) throw new Error("Plugin instance not set yet");
  return pluginInstance;
}

// Return the Settings
export function getSettings(): AgentSettings {
  if (!pluginInstance) throw new Error("Plugin instance not set yet");
  return pluginInstance.settings
}
