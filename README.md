# Video Summarizer and Transcript Generator

Create video summaries and speaker-labeled transcripts in Obsidian with WayinVideo.

This plugin lets you paste a video or audio link, choose an output language, and automatically create a new Obsidian note with the generated summary or transcript.

## Requirements

- Obsidian 1.5.0 or later
- A WayinVideo API Key

Register for WayinVideo and get your API Key here:

https://wayin.ai/api/

## Installation

Install the plugin from Obsidian Community Plugins when it is available.

After installation:

1. Open Obsidian.
2. Go to `Settings -> Community plugins`.
3. Enable `Video Summarizer and Transcript Generator`.
4. Open the plugin settings.
5. Paste your `WayinVideo API Key`.

## How to Use

1. Click the WayinVideo icon in the left ribbon.
2. Choose a task:
   - `Video Summary`
   - `Video Transcript`
3. Paste a supported video or audio URL.
4. Choose the output language.
5. Click `Create`.
6. Wait for processing to finish.
7. A new Obsidian note will be created and opened automatically.

You can also run the plugin from the Command Palette:

```text
Video Summarizer and Transcript Generator: Create video summary or transcript
```

## What It Creates

For video summaries, the note includes:

- Video title
- Source link
- YouTube embed when available
- Overview
- Smart tags
- Highlights
- Clickable timestamps

For transcripts, the note includes:

- Video title
- Source link
- YouTube embed when available
- Speaker-labeled transcript
- Consistent speaker colors
- Clickable timestamps

## Supported Sources

WayinVideo supports common video and audio URLs, including YouTube, TikTok, Vimeo, Twitch, Instagram, Facebook, Zoom, Rumble, and Google Drive.

## License

Copyright (c) WayinVideo. All rights reserved.

See [LICENSE](LICENSE) for details.
