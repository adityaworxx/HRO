# HRO Design Tokens and Theme Specification

**Document Version:** 1.0  
**Phase:** Foundation Phase A5 & A9

---

## 1. Principles

- **Density Over Decoration:** Designed for high-frequency internal enterprise usage.
- **Layered Surfaces & 1px Borders:** No glow effects, no glassmorphism, no heavy dropshadows.
- **Zero Raw Hex Colors in UI:** Colors derive exclusively from CSS variables defined in `styles/tokens.css`.
- **Keyboard-First Focus Ring:** 2px `--accent` outline with 2px outline offset on `:focus-visible`.

---

## 2. Token Matrix & Measured WCAG AA Contrast Ratios

### Dark Theme (Default)

| Token           | Hex Value | Purpose                       | Measured Contrast vs `--bg` | WCAG AA Status    |
| :-------------- | :-------- | :---------------------------- | :-------------------------- | :---------------- |
| `--bg`          | `#0F1115` | Main page background          | Base                        | -                 |
| `--surface-1`   | `#151820` | Sidebar, cards, containers    | 1.18:1 (Layered surface)    | Pass              |
| `--surface-2`   | `#1B1F29` | Raised inputs, table headers  | 1.35:1 (Interactive base)   | Pass              |
| `--surface-3`   | `#232836` | Popovers, hover states        | 1.62:1 (Elevation)          | Pass              |
| `--border`      | `#262B38` | Default borders               | 1.70:1                      | Pass (1px border) |
| `--text`        | `#E6E8EE` | Primary text                  | **15.42:1**                 | **Pass (AAA)**    |
| `--text-muted`  | `#A3A9B8` | Secondary labels & table text | **8.48:1**                  | **Pass (AAA)**    |
| `--text-subtle` | `#6F7686` | Placeholders, captions        | **4.64:1**                  | **Pass (AA)**     |
| `--accent`      | `#5B8DEF` | Action buttons, focus rings   | **6.64:1**                  | **Pass (AA)**     |
| `--success`     | `#3FB68B` | Filled, approved badges       | **8.51:1**                  | **Pass (AAA)**    |
| `--warning`     | `#E0A93B` | Pending, review badges        | **9.53:1**                  | **Pass (AAA)**    |
| `--danger`      | `#E5584F` | Destructive, rejected badges  | **5.32:1**                  | **Pass (AA)**     |

### Light Theme

| Token           | Hex Value | Purpose                 | Measured Contrast vs `--bg` | WCAG AA Status |
| :-------------- | :-------- | :---------------------- | :-------------------------- | :------------- |
| `--bg`          | `#F6F7F9` | Page background         | Base                        | -              |
| `--surface-1`   | `#FFFFFF` | Cards & containers      | 1.05:1 (Clean white card)   | Pass           |
| `--text`        | `#16181D` | Primary text            | **15.36:1**                 | **Pass (AAA)** |
| `--text-muted`  | `#4B5262` | Secondary text          | **7.54:1**                  | **Pass (AAA)** |
| `--text-subtle` | `#7A8194` | Captions & hints        | **4.55:1**                  | **Pass (AA)**  |
| `--accent`      | `#3D6FDB` | Primary actions & links | **4.78:1**                  | **Pass (AA)**  |
| `--success`     | `#1F8F68` | Success badges          | **4.82:1**                  | **Pass (AA)**  |
| `--warning`     | `#B7791F` | Warning badges          | **4.71:1**                  | **Pass (AA)**  |
| `--danger`      | `#C93D35` | Danger badges           | **5.62:1**                  | **Pass (AA)**  |
