import {
  addIcon,
  App,
  MarkdownView,
  Modal,
  normalizePath,
  Notice,
  Plugin,
  PluginSettingTab,
  requestUrl,
  Setting,
  TFile
} from "obsidian";

const API_VERSION = "v2";
const SIGNUP_URL = "https://wayin.ai/wayinvideo";
const WAYINVIDEO_ICON_ID = "wayinvideo-logo";
const WAYINVIDEO_ICON_SVG = `<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_1369_1184)"><path d="M182.749 118.251H189.363C191.045 111.102 192.001 103.647 192.001 96.0002C192.001 88.3538 191.084 80.8986 189.363 73.7493H182.749C167.992 73.7493 153.425 69.8496 140.656 62.4709L51.4612 10.9727C24.6225 25.042 5.31545 51.4219 0.957031 82.619H112.441V69.3908C112.441 65.797 116.341 63.5414 119.437 65.3383L165.507 91.9476C168.603 93.7445 168.603 98.2558 165.507 100.053L119.437 126.662C116.341 128.459 112.441 126.203 112.441 122.609V109.381H0.957031C5.31545 140.578 24.6225 166.958 51.4612 181.028L140.656 129.529C153.425 122.151 167.992 118.251 182.749 118.251Z" fill="url(#paint0_radial_1369_1184)"/><path d="M74.8214 189.63C81.6267 191.159 88.7378 192 96.0018 192C134.195 192 167.189 169.673 182.635 137.367C171.28 137.367 160.04 140.387 150.176 146.084L74.7832 189.591L74.8214 189.63Z" fill="url(#paint1_radial_1369_1184)"/><path d="M182.634 54.6332C167.188 22.3274 134.194 0 96.0007 0C88.6985 0 81.6256 0.841099 74.8203 2.37037L150.213 45.8781C160.077 51.5747 171.279 54.595 182.672 54.595L182.634 54.6332Z" fill="url(#paint2_radial_1369_1184)"/><path d="M182.747 73.7488H189.361C187.793 67.0965 185.538 60.6736 182.632 54.633C171.239 54.633 160.037 51.6126 150.173 45.9161L74.8186 2.37012C66.5988 4.24347 58.7613 7.14909 51.459 10.9723L140.654 62.4705C153.423 69.8492 167.989 73.7488 182.747 73.7488Z" fill="#214B30"/><path d="M182.747 118.251C167.989 118.251 153.423 122.15 140.654 129.529L51.459 181.027C58.7613 184.85 66.5605 187.756 74.8186 189.629L150.212 146.122C160.075 140.425 171.277 137.405 182.67 137.405C185.576 131.364 187.832 124.941 189.399 118.289H182.785L182.747 118.251Z" fill="#214B30"/><path d="M126.593 82.2856H1.07611C0.387399 86.7526 0 91.3371 0 95.9999C0 100.663 0.387399 105.247 1.07611 109.714H126.593V82.2856Z" fill="#214B30"/><path d="M122.61 87.2836V104.717C122.61 107.279 119.437 109.382 115.499 109.382H112.479V122.61C112.479 126.204 116.378 128.459 119.475 126.662L165.544 100.053C168.641 98.2561 168.641 93.7447 165.544 91.9479L119.475 65.3385C116.378 63.5416 112.479 65.7973 112.479 69.3911V82.6193H115.499C119.437 82.6193 122.61 84.7221 122.61 87.2836Z" fill="#214B30"/><path d="M115.46 109.381C119.398 109.381 122.571 107.278 122.571 104.717V87.2832C122.571 84.7216 119.398 82.6189 115.46 82.6189H112.439V109.381H115.46Z" fill="#214B30"/></g><defs><radialGradient id="paint0_radial_1369_1184" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(96.4791 96.0001) rotate(90) scale(85.0275 95.5221)"><stop stop-color="#00FF5B"/><stop offset="1" stop-color="#1ED760"/></radialGradient><radialGradient id="paint1_radial_1369_1184" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(128.709 164.683) rotate(90) scale(27.3166 53.9259)"><stop stop-color="#00FF5B"/><stop offset="1" stop-color="#1ED760"/></radialGradient><radialGradient id="paint2_radial_1369_1184" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(128.746 27.3166) rotate(90) scale(27.3166 53.9259)"><stop stop-color="#00FF5B"/><stop offset="1" stop-color="#1ED760"/></radialGradient><clipPath id="clip0_1369_1184"><rect width="192" height="192" fill="white"/></clipPath></defs></svg>`;

const TASKS = {
  summary: {
    label: "Video Summary",
    submitUrl: "https://wayinvideo-api.wayin.ai/api/v2/summaries",
    resultUrl: (id: string) => `https://wayinvideo-api.wayin.ai/api/v2/summaries/results/${encodeURIComponent(id)}`
  },
  transcript: {
    label: "Video Transcript",
    submitUrl: "https://wayinvideo-api.wayin.ai/api/v2/transcripts",
    resultUrl: (id: string) => `https://wayinvideo-api.wayin.ai/api/v2/transcripts/results/${encodeURIComponent(id)}`
  }
} as const;

const LANGUAGE_OPTIONS = [
  { code: "ar", name: "Arabic" },
  { code: "af", name: "Afrikaans" },
  { code: "sq", name: "Albanian" },
  { code: "am", name: "Amharic" },
  { code: "hy", name: "Armenian" },
  { code: "as", name: "Assamese" },
  { code: "az", name: "Azerbaijani" },
  { code: "ba", name: "Bashkir" },
  { code: "eu", name: "Basque" },
  { code: "be", name: "Belarusian" },
  { code: "bn", name: "Bengali" },
  { code: "bs", name: "Bosnian" },
  { code: "br", name: "Breton" },
  { code: "bg", name: "Bulgarian" },
  { code: "my", name: "Burmese" },
  { code: "ca", name: "Catalan" },
  { code: "zh-cn", name: "Chinese Simplified" },
  { code: "zh-tw", name: "Chinese Traditional" },
  { code: "hr", name: "Croatian" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "en", name: "English" },
  { code: "et", name: "Estonian" },
  { code: "fo", name: "Faroese" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "gl", name: "Galician" },
  { code: "ka", name: "Georgian" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "gu", name: "Gujarati" },
  { code: "ht", name: "Haitian Creole" },
  { code: "ha", name: "Hausa" },
  { code: "haw", name: "Hawaiian" },
  { code: "he", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "hu", name: "Hungarian" },
  { code: "is", name: "Icelandic" },
  { code: "id", name: "Indonesian" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "jw", name: "Javanese" },
  { code: "kn", name: "Kannada" },
  { code: "kk", name: "Kazakh" },
  { code: "km", name: "Khmer" },
  { code: "ko", name: "Korean" },
  { code: "lo", name: "Lao" },
  { code: "la", name: "Latin" },
  { code: "lv", name: "Latvian" },
  { code: "ln", name: "Lingala" },
  { code: "lt", name: "Lithuanian" },
  { code: "lb", name: "Luxembourgish" },
  { code: "mk", name: "Macedonian" },
  { code: "mg", name: "Malagasy" },
  { code: "ms", name: "Malay" },
  { code: "ml", name: "Malayalam" },
  { code: "mt", name: "Maltese" },
  { code: "mi", name: "Maori" },
  { code: "mr", name: "Marathi" },
  { code: "mn", name: "Mongolian" },
  { code: "ne", name: "Nepali" },
  { code: "no", name: "Norwegian" },
  { code: "nn", name: "Norwegian Nynorsk" },
  { code: "oc", name: "Occitan" },
  { code: "ps", name: "Pashto" },
  { code: "fa", name: "Persian" },
  { code: "sv", name: "Swedish" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese" },
  { code: "pa", name: "Punjabi" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sa", name: "Sanskrit" },
  { code: "sr", name: "Serbian" },
  { code: "sn", name: "Shona" },
  { code: "sd", name: "Sindhi" },
  { code: "si", name: "Sinhala" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "so", name: "Somali" },
  { code: "es", name: "Spanish" },
  { code: "su", name: "Sundanese" },
  { code: "sw", name: "Swahili" },
  { code: "tl", name: "Tagalog" },
  { code: "tg", name: "Tajik" },
  { code: "ta", name: "Tamil" },
  { code: "tt", name: "Tatar" },
  { code: "te", name: "Telugu" },
  { code: "th", name: "Thai" },
  { code: "bo", name: "Tibetan" },
  { code: "tr", name: "Turkish" },
  { code: "tk", name: "Turkmen" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "uz", name: "Uzbek" },
  { code: "vi", name: "Vietnamese" },
  { code: "cy", name: "Welsh" },
  { code: "yi", name: "Yiddish" },
  { code: "yo", name: "Yoruba" }
];

type TaskKind = keyof typeof TASKS;

interface WayinVideoSettings {
  apiKey: string;
  targetLang: string;
  pollIntervalSec: number;
  pollTimeoutSec: number;
}

interface TaskRequest {
  taskKind: TaskKind;
  videoUrl: string;
  targetLang: string;
}

interface SubmittedTask {
  id: string;
  name?: string;
}

interface TaskResultData {
  status?: string;
  title?: string;
  video_thumbnail?: string;
  summary?: unknown;
  tags?: unknown;
  highlights?: unknown;
  transcript?: unknown;
  cost_usage?: unknown;
  error_message?: unknown;
  [key: string]: unknown;
}

interface SummaryHighlight {
  start?: unknown;
  end?: unknown;
  desc?: unknown;
  title?: unknown;
  events?: unknown;
  [key: string]: unknown;
}

interface SummaryEvent {
  timestamp?: unknown;
  desc?: unknown;
  title?: unknown;
  [key: string]: unknown;
}

interface TranscriptSegment {
  text?: unknown;
  language?: unknown;
  start?: unknown;
  end?: unknown;
  speaker?: unknown;
  [key: string]: unknown;
}

const DEFAULT_SETTINGS: WayinVideoSettings = {
  apiKey: "",
  targetLang: "en",
  pollIntervalSec: 10,
  pollTimeoutSec: 3600
};

function readSettings(value: unknown): Partial<WayinVideoSettings> {
  if (!isRecord(value)) return {};

  const settings: Partial<WayinVideoSettings> = {};

  if (typeof value.apiKey === "string") {
    settings.apiKey = value.apiKey;
  }

  if (typeof value.targetLang === "string") {
    settings.targetLang = value.targetLang;
  }

  if (typeof value.pollIntervalSec === "number" && Number.isFinite(value.pollIntervalSec)) {
    settings.pollIntervalSec = value.pollIntervalSec;
  }

  if (typeof value.pollTimeoutSec === "number" && Number.isFinite(value.pollTimeoutSec)) {
    settings.pollTimeoutSec = value.pollTimeoutSec;
  }

  return settings;
}

export default class VideoSummaryTranscriptsWayinVideoPlugin extends Plugin {
  settings: WayinVideoSettings = DEFAULT_SETTINGS;
  private isRunning = false;

  async onload() {
    await this.loadSettings();
    addIcon(WAYINVIDEO_ICON_ID, createWayinVideoIconSvgContent());
    this.registerTimestampClickHandler();

    const ribbonIconEl = this.addRibbonIcon(WAYINVIDEO_ICON_ID, "Video Summarizer and Transcript Generator", () => {
      void this.runTask();
    });
    ribbonIconEl.addClass("wayinvideo-ribbon-icon");

    this.addCommand({
      id: "create-video-summary-or-transcript",
      name: "Create video summary or transcript",
      callback: () => {
        void this.runTask();
      }
    });

    this.addSettingTab(new WayinVideoSettingTab(this.app, this));
  }

  async loadSettings() {
    const loadedData: unknown = await this.loadData();
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...readSettings(loadedData)
    };
    if (!this.settings.targetLang.trim()) {
      this.settings.targetLang = DEFAULT_SETTINGS.targetLang;
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private registerTimestampClickHandler() {
    this.registerDomEvent(activeDocument, "click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const timestampEl = target.closest<HTMLElement>(".wayinvideo-timestamp");
      if (!timestampEl) return;

      event.preventDefault();
      event.stopPropagation();
      this.jumpYoutubePlayerToTimestamp(timestampEl);
    }, true);
  }

  private jumpYoutubePlayerToTimestamp(timestampEl: HTMLElement) {
    const seconds = readTimestampSeconds(timestampEl);
    if (!Number.isFinite(seconds)) return;

    const iframe = findYoutubeIframe(timestampEl);
    const baseSrc = iframe ? getBaseYoutubeEmbedSrc(iframe) : null;
    if (!iframe || !baseSrc) {
      new Notice("No YouTube player found in this note.");
      return;
    }

    const startSeconds = Math.max(0, Math.floor(seconds));
    iframe.dataset.wayinvideoBaseSrc = baseSrc;
    iframe.addEventListener("load", () => {
      seekYoutubeIframe(iframe, startSeconds);
    }, { once: true });
    iframe.src = buildYoutubePlayerSrc(baseSrc, startSeconds);
    seekYoutubeIframe(iframe, startSeconds);
    iframe.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  private async runTask() {
    if (this.isRunning) {
      new Notice("A WayinVideo task is already running.");
      return;
    }

    if (!this.settings.apiKey.trim()) {
      new ApiKeyRequiredModal(this.app).open();
      return;
    }

    const request = await promptForTask(this.app, this.settings.targetLang);
    if (!request) return;

    this.settings.targetLang = request.targetLang;
    await this.saveSettings();

    const progress = new ProgressModal(this.app, TASKS[request.taskKind].label);
    progress.open();
    this.isRunning = true;

    try {
      progress.update("Submitting task...", 8);
      const submittedTask = await this.submitTask(request);

      progress.update("Task submitted. Waiting for processing to start...", 18);
      const result = await this.pollTask(request.taskKind, submittedTask.id, progress);
      const resultWithTitle = addSubmittedTaskTitle(result, submittedTask);
      const markdown = this.formatMarkdown(request, resultWithTitle);
      progress.update("Creating note...", 98);
      const file = await this.createResultNote(request, resultWithTitle, markdown);
      await this.openResultNote(file);

      progress.update("Done.", 100);
      window.setTimeout(() => progress.close(), 600);
      new Notice(`${TASKS[request.taskKind].label} note created.`);
    } catch (error) {
      progress.close();
      new Notice(`WayinVideo failed: ${getErrorMessage(error)}`, 12000);
    } finally {
      this.isRunning = false;
    }
  }

  private authHeaders(contentType?: string) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.settings.apiKey.trim()}`,
      "x-wayinvideo-api-version": API_VERSION
    };

    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    return headers;
  }

  private async submitTask(request: TaskRequest): Promise<SubmittedTask> {
    const body: Record<string, string> = {
      video_url: request.videoUrl,
      target_lang: request.targetLang
    };

    const response = await requestUrl({
      url: TASKS[request.taskKind].submitUrl,
      method: "POST",
      headers: this.authHeaders("application/json"),
      body: JSON.stringify(body),
      throw: false
    });

    const responseJson = response.json as unknown;
    assertOkResponse(response.status, responseJson, response.text);

    const data = readResponseData(responseJson);
    const taskId = data ? getFirstString(data, ["id", "export_task_id"]) : null;
    if (!taskId) {
      throw new Error("WayinVideo did not return a task id.");
    }

    return {
      id: taskId,
      name: data ? getFirstString(data, ["name"]) ?? undefined : undefined
    };
  }

  private async pollTask(taskKind: TaskKind, taskId: string, progress: ProgressModal) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < this.settings.pollTimeoutSec * 1000) {
      const response = await requestUrl({
        url: TASKS[taskKind].resultUrl(taskId),
        method: "GET",
        headers: this.authHeaders(),
        throw: false
      });

      const responseJson = response.json as unknown;
      assertOkResponse(response.status, responseJson, response.text);

      const data = readTaskResultData(responseJson);
      if (!data) {
        throw new Error("WayinVideo returned an empty result payload.");
      }

      const status = String(data.status ?? "UNKNOWN").toUpperCase();
      if (status === "SUCCEEDED") {
        progress.update("Finalizing output...", 96);
        return data;
      }

      if (status === "FAILED") {
        throw new Error(readApiMessage(responseJson) ?? readApiMessage(data) ?? "task failed");
      }

      const elapsedRatio = Math.min(1, (Date.now() - startedAt) / Math.max(1, this.settings.pollTimeoutSec * 1000));
      const progressPercent = status === "CREATED"
        ? 25
        : status === "QUEUED"
          ? 35
          : Math.min(90, 45 + Math.round(elapsedRatio * 45));
      progress.update(getProcessingMessage(status), progressPercent);
      await sleep(this.settings.pollIntervalSec * 1000);
    }

    throw new Error("polling timed out");
  }

  private formatMarkdown(request: TaskRequest, result: TaskResultData) {
    const title = getVideoTitle(result) ?? fallbackNoteTitle(request.taskKind);
    const embed = renderYoutubeEmbed(request.videoUrl);
    const lines = [
      renderFrontmatter(request, result),
      "",
      `# ${title}`,
      "",
      embed,
      "",
      request.taskKind === "summary" ? "## Video Summary" : "## Video Transcript",
      ""
    ];

    if (request.taskKind === "summary") {
      lines.push(renderSummaryContent(result));
    } else {
      lines.push(renderTranscriptContent(result));
    }

    return `${lines.join("\n").trim()}\n`;
  }

  private async createResultNote(request: TaskRequest, result: TaskResultData, markdown: string): Promise<TFile> {
    const title = getVideoTitle(result) ?? fallbackNoteTitle(request.taskKind);
    const path = await getAvailableNotePath(this.app, sanitizeFileName(title));
    return this.app.vault.create(path, markdown);
  }

  private async openResultNote(file: TFile) {
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.openFile(file, { state: { mode: "preview" } });

    if (leaf.view instanceof MarkdownView) {
      await leaf.view.setState({ file: file.path, mode: "preview" }, { history: false });
    }
  }
}

class TaskPromptModal extends Modal {
  private taskKind: TaskKind = "summary";
  private videoUrl = "";
  private targetLang: string;
  private resolved = false;

  constructor(app: App, defaultLang: string, private readonly onSubmit: (value: TaskRequest | null) => void) {
    super(app);
    this.targetLang = isSupportedLanguage(defaultLang) ? defaultLang : DEFAULT_SETTINGS.targetLang;
  }

  onOpen() {
    this.modalEl.addClass("wayinvideo-task-modal-shell");
    this.titleEl.empty();
    this.titleEl.addClass("wayinvideo-brand-title");

    const brandMarkEl = this.titleEl.createDiv({ cls: "wayinvideo-brand-mark" });
    appendWayinVideoIcon(brandMarkEl);

    const brandCopyEl = this.titleEl.createDiv({ cls: "wayinvideo-brand-copy" });
    brandCopyEl.createDiv({ cls: "wayinvideo-brand-name", text: "WayinVideo" });
    brandCopyEl.createDiv({ cls: "wayinvideo-brand-product", text: "Video Summarizer and Transcript Generator" });

    this.contentEl.addClass("wayinvideo-task-modal");

    new Setting(this.contentEl)
      .setName("Task")
      .setDesc("Choose whether to generate a structured summary or a speaker-labeled transcript.")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("summary", "Video Summary")
          .addOption("transcript", "Video Transcript")
          .setValue(this.taskKind)
          .onChange((value) => {
            this.taskKind = value as TaskKind;
          });
      });

    const urlSetting = new Setting(this.contentEl)
      .setName("Please Paste a Video Link")
      .setDesc("Paste a supported URL such as YouTube, TikTok, Vimeo, Twitch, Instagram, Facebook, Zoom, Rumble, or Google Drive.")
      .addText((text) => {
        text.setPlaceholder("https://...")
          .onChange((value) => {
            this.videoUrl = value;
          });

        text.inputEl.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            this.submit();
          }
        });

        window.setTimeout(() => text.inputEl.focus(), 50);
      });
    urlSetting.settingEl.addClass("wayinvideo-url-setting");

    new Setting(this.contentEl)
      .setName("Output language")
      .setDesc("Choose the language WayinVideo should use for the generated output.")
      .addDropdown((dropdown) => {
        for (const option of LANGUAGE_OPTIONS) {
          dropdown.addOption(option.code, option.name);
        }
        dropdown.setValue(this.targetLang).onChange((value) => {
          this.targetLang = value;
        });
      });

    new Setting(this.contentEl)
      .addButton((button) => {
        button
          .setButtonText("Cancel")
          .onClick(() => this.cancel());
      })
      .addButton((button) => {
        button
          .setButtonText("Create")
          .setCta()
          .onClick(() => this.submit());
      });
  }

  onClose() {
    this.contentEl.empty();
    if (!this.resolved) {
      this.onSubmit(null);
    }
  }

  private submit() {
    const trimmedUrl = this.videoUrl.trim();
    if (!trimmedUrl) {
      new Notice("Enter a video or audio URL first.");
      return;
    }

    this.resolved = true;
    this.close();
    this.onSubmit({
      taskKind: this.taskKind,
      videoUrl: trimmedUrl,
      targetLang: this.targetLang
    });
  }

  private cancel() {
    this.resolved = true;
    this.close();
    this.onSubmit(null);
  }
}

class ApiKeyRequiredModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    this.titleEl.setText("WayinVideo API key required");
    this.contentEl.addClass("wayinvideo-api-key-modal");

    const text = this.contentEl.createEl("p");
    text.appendText("Add a WayinVideo API key in this plugin's settings before creating summaries or transcripts. You can register and create an API key at ");
    text.createEl("a", {
      text: SIGNUP_URL,
      href: SIGNUP_URL
    });
    text.appendText(".");

    new Setting(this.contentEl)
      .addButton((button) => {
        button
          .setButtonText("Close")
          .setCta()
          .onClick(() => this.close());
      });
  }

  onClose() {
    this.contentEl.empty();
  }
}

class ProgressModal extends Modal {
  private statusEl!: HTMLElement;
  private barEl!: HTMLElement;
  private percentEl!: HTMLElement;

  constructor(app: App, private readonly label: string) {
    super(app);
  }

  onOpen() {
    this.titleEl.setText(this.label);
    this.contentEl.addClass("wayinvideo-progress-modal");

    this.statusEl = this.contentEl.createEl("div", {
      cls: "wayinvideo-progress-status",
      text: "Preparing..."
    });

    const trackEl = this.contentEl.createEl("div", {
      cls: "wayinvideo-progress-track"
    });
    this.barEl = trackEl.createEl("div", {
      cls: "wayinvideo-progress-bar"
    });
    this.percentEl = this.contentEl.createEl("div", {
      cls: "wayinvideo-progress-percent",
      text: "0%"
    });
  }

  update(message: string, percent: number) {
    const clamped = Math.min(100, Math.max(0, Math.round(percent)));
    this.statusEl.setText(message);
    this.percentEl.setText(`${clamped}%`);
    this.barEl.style.width = `${clamped}%`;
  }

  onClose() {
    this.contentEl.empty();
  }
}

class WayinVideoSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: VideoSummaryTranscriptsWayinVideoPlugin) {
    super(app, plugin);
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Configuration")
      .setHeading();

    new Setting(containerEl)
      .setName("WayinVideo API Key")
      .setDesc("Register for WayinVideo and get your API key. Learn more at https://wayin.ai/api/.")
      .addText((text) => {
        text
          .setPlaceholder("WayinVideo API key")
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.type = "password";
      });

    new Setting(containerEl)
      .setName("Default output language")
      .setDesc("The language preselected when submitting a new WayinVideo task.")
      .addDropdown((dropdown) => {
        for (const option of LANGUAGE_OPTIONS) {
          dropdown.addOption(option.code, option.name);
        }
        dropdown
          .setValue(isSupportedLanguage(this.plugin.settings.targetLang) ? this.plugin.settings.targetLang : DEFAULT_SETTINGS.targetLang)
          .onChange(async (value) => {
            this.plugin.settings.targetLang = value;
            await this.plugin.saveSettings();
          });
      });

  }
}

function promptForTask(app: App, defaultLang: string) {
  return new Promise<TaskRequest | null>((resolve) => {
    new TaskPromptModal(app, defaultLang, resolve).open();
  });
}

function renderFrontmatter(request: TaskRequest, result: TaskResultData) {
  const title = getVideoTitle(result) ?? fallbackNoteTitle(request.taskKind);
  const author = getFirstString(result, ["author", "channel", "channel_name", "channel_title", "creator", "uploader"]);
  const published = getFirstString(result, ["published", "published_at", "publish_date", "release_date", "upload_date"]);
  const tags = getTagValues(result.tags);
  const lines = [
    "---",
    `title: ${yamlString(title)}`,
    `source: ${yamlString(request.videoUrl)}`,
    `author: ${yamlString(author ?? "")}`,
    `published: ${yamlString(formatDateProperty(published) ?? "")}`,
    `created: ${yamlString(formatDateProperty(new Date()) ?? "")}`
  ];

  if (tags.length === 0) {
    lines.push("tags: []");
  } else {
    lines.push("tags:");
    lines.push(...tags.map((tag) => `  - ${yamlString(tag)}`));
  }

  lines.push("---");
  return lines.join("\n");
}

function renderYoutubeEmbed(sourceUrl: string) {
  const embedUrl = getYoutubeEmbedUrl(sourceUrl);
  if (!embedUrl) return "";
  const playerUrl = buildYoutubePlayerSrc(embedUrl);

  return `<iframe class="wayinvideo-youtube-player" data-wayinvideo-base-src="${escapeHtmlAttribute(embedUrl)}" src="${escapeHtmlAttribute(playerUrl)}" title="YouTube video player" width="100%" height="390" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
}

function getYoutubeEmbedUrl(sourceUrl: string) {
  try {
    const url = new URL(sourceUrl);
    const host = url.hostname.replace(/^www\./, "");
    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (host.endsWith("youtube.com")) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else {
        const parts = url.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].includes(parts[0])) {
          videoId = parts[1] ?? null;
        }
      }
    }

    return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}` : null;
  } catch {
    return null;
  }
}

async function getAvailableNotePath(app: App, baseName: string) {
  let suffix = 0;

  while (true) {
    const fileName = suffix === 0 ? `${baseName}.md` : `${baseName} ${suffix + 1}.md`;
    const path = normalizePath(fileName);
    if (!await app.vault.adapter.exists(path)) {
      return path;
    }
    suffix += 1;
  }
}

function sanitizeFileName(value: string) {
  const cleaned = value
    .replace(/[\\/:*?"<>|#^[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 120) || "WayinVideo Note";
}

function getVideoTitle(result: TaskResultData) {
  return getFirstString(result, [
    "title",
    "video_title",
    "videoTitle",
    "name",
    "video_name",
    "videoName"
  ]) ?? getFirstNestedString(result, [
    ["video", "title"],
    ["video", "name"],
    ["metadata", "title"],
    ["metadata", "name"],
    ["video_info", "title"],
    ["videoInfo", "title"]
  ]);
}

function fallbackNoteTitle(taskKind: TaskKind) {
  return taskKind === "summary" ? "WayinVideo Summary" : "WayinVideo Transcript";
}

function addSubmittedTaskTitle(result: TaskResultData, submittedTask: SubmittedTask): TaskResultData {
  if (getVideoTitle(result) || !submittedTask.name) {
    return result;
  }

  return {
    ...result,
    title: submittedTask.name
  };
}

function getFirstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function getFirstNestedString(record: Record<string, unknown>, paths: string[][]) {
  for (const path of paths) {
    let current: unknown = record;
    for (const key of path) {
      if (!isRecord(current)) {
        current = null;
        break;
      }
      current = current[key];
    }

    if (typeof current === "string" && current.trim()) {
      return current.trim();
    }
  }

  return null;
}

function getTagValues(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((tag) => String(tag).trim().replace(/^#/, ""))
    .filter(Boolean)
    .map(normalizeTagSlug);
}

function normalizeTagSlug(value: string) {
  return value
    .trim()
    .replace(/^#/, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function yamlString(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function formatDateProperty(value: string | Date | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return value instanceof Date ? null : value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createWayinVideoIconSvgContent() {
  const parser = new DOMParser();
  const doc = parser.parseFromString(WAYINVIDEO_ICON_SVG, "image/svg+xml");
  const svg = doc.documentElement;
  const defs = Array.from(svg.querySelectorAll("defs")).map((node) => node.outerHTML).join("");
  const graphicSvg = svg.cloneNode(true) as SVGElement;

  for (const node of Array.from(graphicSvg.querySelectorAll("defs"))) {
    node.remove();
  }

  return `${defs}<g transform="scale(0.5208333333)">${graphicSvg.innerHTML}</g>`;
}

function appendWayinVideoIcon(parentEl: HTMLElement) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(WAYINVIDEO_ICON_SVG, "image/svg+xml");
  const svg = doc.documentElement;

  if (svg.instanceOf(SVGElement)) {
    parentEl.appendChild(parentEl.doc.importNode(svg, true));
  }
}

function assertOkResponse(status: number, json: unknown, text?: string) {
  if (status >= 200 && status < 300) return;
  throw new Error(readApiMessage(json) ?? readTextMessage(text) ?? `HTTP ${status}`);
}

function readResponseData(json: unknown) {
  if (!isRecord(json)) return null;
  return isRecord(json.data) ? json.data : null;
}

function readTaskResultData(json: unknown): TaskResultData | null {
  const data = readResponseData(json);
  return data ? data : null;
}

function readApiMessage(json: unknown) {
  if (!isRecord(json)) return null;
  for (const key of ["message", "error", "detail", "error_message"]) {
    const value = json[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  const data = json.data;
  if (isRecord(data)) {
    return readApiMessage(data);
  }

  return null;
}

function readTextMessage(text?: string) {
  const trimmed = text?.trim();
  if (!trimmed) return null;

  try {
    return readApiMessage(JSON.parse(trimmed)) ?? trimmed;
  } catch {
    return trimmed;
  }
}

function getProcessingMessage(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "created") return "Task created. Waiting to start...";
  if (normalized === "queued") return "Task queued. Waiting for processing...";
  if (normalized === "processing" || normalized === "running") return "Processing video...";
  return "Processing...";
}

function renderSummaryContent(result: TaskResultData) {
  const lines: string[] = [];

  if (typeof result.title === "string" && result.title.trim()) {
    lines.push(`### ${escapeMarkdown(result.title.trim())}`, "");
  }

  lines.push("> [!summary] Overview", `> ${renderSummary(result.summary).replace(/\n/g, "\n> ")}`, "");
  lines.push("### Tags", "", renderTags(result.tags), "");
  lines.push("### Highlights", "", renderHighlights(result.highlights));

  return lines.join("\n").trim();
}

function renderSummary(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (value !== undefined && value !== null) {
    return renderValue(value, 4);
  }

  return "No summary returned.";
}

function renderTags(value: unknown) {
  const tags = getTagValues(value);
  if (tags.length === 0) {
    return "_No tags returned._";
  }

  return tags.map((tag) => `#${tag}`).join(" ");
}

function renderHighlights(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    return "_No highlights returned._";
  }

  const highlights = value.filter(isRecord) as SummaryHighlight[];
  if (highlights.length === 0) {
    return "_No highlights returned._";
  }

  return highlights
    .map((highlight, index) => renderHighlight(highlight, highlights[index + 1], index))
    .join("\n\n");
}

function renderHighlight(highlight: SummaryHighlight, nextHighlight: SummaryHighlight | undefined, index: number) {
  const startMs = readMilliseconds(highlight.start) ?? 0;
  const nextStartMs = nextHighlight ? readMilliseconds(nextHighlight.start) : null;
  const fallbackEndMs = nextStartMs ?? readMilliseconds(highlight.end) ?? startMs;
  const events = getSummaryEvents(highlight.events);
  const eventRanges = createEventRanges(events, startMs, fallbackEndMs);
  const title = readDescription(highlight.desc) ?? readDescription(highlight.title) ?? `Highlight ${index + 1}`;
  const lines = [
    `#### ${title}`
  ];

  if (eventRanges.length > 0) {
    lines.push("", ...eventRanges.map(renderSummaryEventRange));
  }

  return lines.join("\n").trim();
}

function renderSummaryEventRange(eventRange: { startMs: number; endMs: number; description: string }) {
  return [
    `<li class="wayinvideo-summary-event">`,
    `<div class="wayinvideo-summary-event-text">${escapeHtml(normalizeMarkdownLine(eventRange.description))}</div>`,
    `<div class="wayinvideo-summary-event-time">${renderClickableTimestamp(eventRange.startMs, eventRange.endMs)}</div>`,
    `</li>`
  ].join("");
}

function getSummaryEvents(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord) as SummaryEvent[];
}

function createEventRanges(events: SummaryEvent[], highlightStartMs: number, highlightEndMs: number) {
  return events.map((event, index) => {
    const startMs = readMilliseconds(event.timestamp) ?? (index === 0 ? highlightStartMs : highlightEndMs);
    const nextEvent = events[index + 1];
    const nextStartMs = nextEvent ? readMilliseconds(nextEvent.timestamp) : null;
    const endMs = nextStartMs ?? highlightEndMs;
    const description = readDescription(event.desc) ?? readDescription(event.title) ?? "Event";
    return {
      startMs,
      endMs: Math.max(startMs, endMs),
      description
    };
  });
}

function renderTranscriptContent(result: TaskResultData) {
  if (!Array.isArray(result.transcript) || result.transcript.length === 0) {
    return "_No transcript returned._";
  }

  const segments = result.transcript.filter(isRecord) as TranscriptSegment[];
  if (segments.length === 0) {
    return "_No transcript returned._";
  }

  const speakerColorIndexByName = new Map<string, number>();
  const lines = [
    "### Transcript",
    "",
    `<div class="wayinvideo-transcript">`,
    ...segments.map((segment) => renderTranscriptSegment(segment, speakerColorIndexByName)),
    `</div>`
  ];

  return lines.join("\n").trim();
}

function renderTranscriptSegment(segment: TranscriptSegment, speakerColorIndexByName: Map<string, number>) {
  const speaker = readDescription(segment.speaker) ?? "Speaker";
  const speakerColorIndex = getSpeakerColorIndex(speaker, speakerColorIndexByName);
  const startMs = readMilliseconds(segment.start) ?? 0;
  const endMs = readMilliseconds(segment.end) ?? startMs;
  const text = readDescription(segment.text) ?? "";

  return [
    `<div class="wayinvideo-transcript-segment wayinvideo-speaker-card-${speakerColorIndex}">`,
    `<div class="wayinvideo-transcript-meta">`,
    `<span class="wayinvideo-speaker-pill wayinvideo-speaker-${speakerColorIndex}">${escapeHtml(speaker)}</span>`,
    renderClickableTimestamp(startMs, endMs),
    `</div>`,
    `<div class="wayinvideo-transcript-text">${renderTranscriptText(text)}</div>`,
    `</div>`
  ].join("\n");
}

function getSpeakerColorIndex(speaker: string, speakerColorIndexByName: Map<string, number>) {
  const normalizedSpeaker = speaker.trim().toLowerCase() || "speaker";
  const existingIndex = speakerColorIndexByName.get(normalizedSpeaker);
  if (existingIndex !== undefined) {
    return existingIndex;
  }

  const nextIndex = speakerColorIndexByName.size % 10;
  speakerColorIndexByName.set(normalizedSpeaker, nextIndex);
  return nextIndex;
}

function renderTranscriptText(value: string) {
  const lines = value.trim().split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    return `<em>No text returned.</em>`;
  }

  return lines.map(escapeHtml).join("<br>");
}

function readMilliseconds(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, parsed);
    }
  }

  return null;
}

function readDescription(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
}

function formatTimestamp(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function renderTimeRange(startMs: number, endMs: number) {
  return `${formatTimestamp(startMs)} - ${formatTimestamp(endMs)}`;
}

function renderClickableTimestamp(startMs: number, endMs: number) {
  const seconds = Math.max(0, Math.floor(startMs / 1000));
  const label = renderTimeRange(startMs, endMs);
  return `<span class="wayinvideo-timestamp" data-wayinvideo-seconds="${seconds}" title="Jump YouTube player to ${formatTimestamp(startMs)}">${label}</span>`;
}

function readTimestampSeconds(timestampEl: HTMLElement) {
  const rawSeconds = timestampEl.dataset.wayinvideoSeconds;
  if (rawSeconds) {
    const seconds = Number(rawSeconds);
    if (Number.isFinite(seconds)) return Math.max(0, seconds);
  }

  return parseTimestampSeconds(timestampEl.textContent ?? "");
}

function parseTimestampSeconds(value: string) {
  const match = value.match(/\b(\d{1,2}):(\d{2}):(\d{2})\b/);
  if (!match) return Number.NaN;

  const [, hours, minutes, seconds] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

function findYoutubeIframe(timestampEl: HTMLElement) {
  const selector = "iframe.wayinvideo-youtube-player, iframe[src*='youtube.com/embed'], iframe[src*='youtube-nocookie.com/embed']";
  const currentDocument = activeDocument;
  const containers = [
    timestampEl.closest(".markdown-preview-view"),
    timestampEl.closest(".markdown-rendered"),
    timestampEl.closest(".markdown-reading-view"),
    timestampEl.closest(".workspace-leaf-content"),
    currentDocument.activeElement?.closest?.(".workspace-leaf-content"),
    currentDocument
  ].filter(Boolean) as ParentNode[];

  for (const container of containers) {
    const iframe = container.querySelector<HTMLIFrameElement>(selector);
    if (iframe) return iframe;
  }

  return null;
}

function getBaseYoutubeEmbedSrc(iframe: HTMLIFrameElement) {
  const datasetSrc = iframe.dataset.wayinvideoBaseSrc;
  const source = datasetSrc || iframe.src;
  if (!source) return null;

  try {
    const url = new URL(source);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return source.split("?")[0].split("#")[0] || null;
  }
}

function buildYoutubePlayerSrc(baseSrc: string, startSeconds?: number) {
  try {
    const url = new URL(baseSrc);
    url.search = "";
    url.hash = "";
    url.searchParams.set("enablejsapi", "1");
    url.searchParams.set("playsinline", "1");
    url.searchParams.set("rel", "0");

    if (window.location.origin && window.location.origin !== "null") {
      url.searchParams.set("origin", window.location.origin);
    }

    if (typeof startSeconds === "number" && Number.isFinite(startSeconds)) {
      url.searchParams.set("start", String(Math.max(0, Math.floor(startSeconds))));
      url.searchParams.set("autoplay", "1");
    }

    return url.toString();
  } catch {
    const separator = baseSrc.includes("?") ? "&" : "?";
    const start = typeof startSeconds === "number" && Number.isFinite(startSeconds)
      ? `&start=${Math.max(0, Math.floor(startSeconds))}&autoplay=1`
      : "";
    return `${baseSrc}${separator}enablejsapi=1&playsinline=1&rel=0${start}`;
  }
}

function seekYoutubeIframe(iframe: HTMLIFrameElement, seconds: number) {
  const targetWindow = iframe.contentWindow;
  if (!targetWindow) return;

  const startSeconds = Math.max(0, Math.floor(seconds));
  targetWindow.postMessage(JSON.stringify({
    event: "command",
    func: "seekTo",
    args: [startSeconds, true]
  }), "*");
  targetWindow.postMessage(JSON.stringify({
    event: "command",
    func: "playVideo",
    args: []
  }), "*");
}

function normalizeMarkdownLine(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function renderValue(value: unknown, headingLevel: number): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (isRecord(item)) {
          return renderObject(item, headingLevel);
        }
        return `- ${renderValue(item, headingLevel).replace(/\n/g, "\n  ")}`;
      })
      .filter(Boolean)
      .join("\n\n");
  }

  if (isRecord(value)) {
    return renderObject(value, headingLevel);
  }

  return JSON.stringify(value, null, 2);
}

function renderObject(record: Record<string, unknown>, headingLevel: number): string {
  const lines: string[] = [];
  const entries = Object.entries(record).filter(([, value]) => value !== null && value !== undefined && value !== "");

  for (const [key, value] of entries) {
    const label = humanizeKey(key);

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      lines.push(`- ${label}: ${String(value).trim()}`);
      continue;
    }

    const hashes = "#".repeat(Math.min(Math.max(headingLevel, 3), 6));
    lines.push(`${hashes} ${label}`, "", renderValue(value, headingLevel + 1));
  }

  return lines.join("\n").trim();
}

function humanizeKey(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isSupportedLanguage(value: string) {
  return LANGUAGE_OPTIONS.some((option) => option.code === value);
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeMarkdown(value: string) {
  return value.replace(/([\\`*_{}[\]()#+.!|>~-])/g, "\\$1");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}
