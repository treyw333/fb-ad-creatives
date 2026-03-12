# Requirements Document

## Introduction

Add a keyboard shortcut help overlay to the presentation app. Pressing "?" displays a translucent panel listing available keyboard shortcuts. Pressing "?" again or Escape dismisses it.

## Glossary

- **Overlay**: A translucent HTML panel rendered on top of the slide viewport showing keyboard shortcut information
- **Shortcut_List**: The set of keyboard shortcuts currently available in the app (e.g., arrow keys for navigation, "F" for fullscreen)
- **App**: The presentation application defined in `app.js`

## Requirements

### Requirement 1: Toggle Overlay Visibility

**User Story:** As a viewer, I want to press "?" to see available keyboard shortcuts, so that I can navigate the presentation without guessing controls.

#### Acceptance Criteria

1. WHEN the user presses the "?" key and the Overlay is not visible, THE App SHALL display the Overlay centered in the slide viewport
2. WHEN the user presses the "?" key and the Overlay is visible, THE App SHALL hide the Overlay
3. WHEN the user presses the Escape key and the Overlay is visible, THE App SHALL hide the Overlay
4. WHILE the Overlay is visible, THE App SHALL display a translucent dark background behind the Overlay content

### Requirement 2: Display Shortcut Content

**User Story:** As a viewer, I want the overlay to list all keyboard shortcuts with their descriptions, so that I can quickly learn the controls.

#### Acceptance Criteria

1. THE Overlay SHALL display each entry in the Shortcut_List as a key label paired with a description
2. THE Overlay SHALL style key labels using the JetBrains Mono font to visually distinguish them from descriptions
3. THE Overlay SHALL include a title reading "Keyboard Shortcuts"

### Requirement 3: Non-Interference

**User Story:** As a viewer, I want the overlay to not interfere with normal presentation use, so that it stays out of the way when I don't need it.

#### Acceptance Criteria

1. WHILE the Overlay is hidden, THE App SHALL not intercept any keyboard events other than the "?" key for toggling
2. WHILE a text input element has focus, THE App SHALL ignore the "?" key so that users can type normally
3. IF the user navigates to a different slide while the Overlay is visible, THEN THE App SHALL hide the Overlay
