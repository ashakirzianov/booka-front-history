[[reader-screen-only.jpeg|"Reader screen mockup"]]

(TODO: add an actual mockup)

Reader screen:
- 2 layers:
  - Book text layer: bottom layer, always visible
  - Control elements layer: top layer, touch toggles visibility

---
Book text layer:
- Only scroll mode is available in the first iteration
- Chapter title centred and with larger font size
- Subparts title left aligned, with some styling
- First paragraph of each chapter starts with a dropped capital
- (maybe) Show special symbol on the right to indicate that there is popular or many comments to this paragraph (or any comments at the early stage)
- (later) Page number in gray on the left
- (action) touch anywhere toggle control elements layer's visibility
- (action) selection triggers context menu

---
Context menu:
- Highlight button. On click show menu to choose notebook to add note to. There should be multiple default notebooks and at least one public notebook.
- Comment. On click starts a new comment under current paragraph with selected text quoted.
- Copy button. On click copies selected text to the buffer with link to selected quote added in front (or in end?).
- (later) Language button. Shows original/different translation if available. Shows word/phrase definition/translation.

---
Control elements layer:
(TODO: define control elements layer)
- Top menu, left to right:
  - (left aligned) Back button
  - (left aligned) Table of content
  - (left aligned) Search button
  - (centered, when enough space) Name of the book
  - (right aligned) Appearance settings
  - (right aligned) Book menu button
- Bottom menu, left to right:
  - (on top) Page slider
  - (left aligned) Back to NN page (after navigating around the book)
  - (centred) Page number on top, percentage complete on bottom. Possibly shows table of content on click
  - (right aligned) Pages left in current chapter
- Under each paragraph:
  - Some sort of indication that shows overall rating/popularity/number of comments related to that paragraph
  - Comments/ask button. On click toggles comment "mode" (TODO: define and add a link)

Appearance settings:
- Larger/smaller font pair of buttons
- Theme selector: white, sepia (default), dark, black
- Layout orientation selector: auto (default), portrait, landscape
- (maybe) Brightness slider

Book menu:
- Open notebooks screen (TODO: define and add a link)
- Report an error