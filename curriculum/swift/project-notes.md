---
id: project-notes
title: "Project: Notes for Mac"
type: project
minutes: 300
---
# --description--

This is the project for the Mac chapter. Build **Notes**, a fast, keyboard-friendly notes app for the Mac that feels like it belongs there.

## User stories

1. A three-column layout: folders in a sidebar, notes in the middle, and the selected note's editor on the right, with `NavigationSplitView`.
2. I can create, rename and delete folders and notes. New notes go in the selected folder.
3. Notes are stored with SwiftData and sync through iCloud.
4. The editor is a `TextEditor`; the note's title is its first line.
5. A search field (`.searchable`) filters notes by title and text.
6. A **Note** menu has New Note, Pin Note and Delete Note, each with a keyboard shortcut. Pinned notes sort to the top.
7. A `Settings` scene lets me choose the editor's font size, saved with `@AppStorage`.
8. A `MenuBarExtra` lets me jot a quick note from anywhere; it goes into an Inbox folder.
9. The app runs in the App Sandbox, asking only for what it needs.
10. Everything works with the keyboard alone, and with VoiceOver.

## Stretch goals

- Export a note as a plain-text file with `.fileExporter`.
- Show a word count in the window's toolbar.
- Use the on-device model to suggest a title for a note.

# --checklist--

- Every user story works.
- I used Notes for my own notes for a week, and fixed what annoyed me.
- Every menu command has a shortcut, and the app works without a mouse.
- The app runs sandboxed, with only the entitlements it needs.

# --questions--

## Why should every command in Notes be in a menu as well as a toolbar?
- [x] Menus are where Mac users find and learn commands and their shortcuts
- [ ] Toolbars do not work on the Mac
- [ ] To fill the menu bar
Why: That is what makes an app feel at home on the Mac.
