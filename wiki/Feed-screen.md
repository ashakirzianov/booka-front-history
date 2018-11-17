[[feed-screen.jpeg|Feed screen "mockup"]]

(TODO: add an actual mockup)

Feed screen should:
- Have a "continue reading" button on top
- Show an actual feed which consists of "news blocks"
- News block could be one of:
  - New comment/public note
- App menu at the bottom (to be defined)(TODO: add link once defined)

---
New comment block should feature:
- Author name
- Author profile pic
- Rating block for comment (overall rating, up/down vote buttons)
- Name of the book to which comment belongs
- Comment:
  - if comment is too long, then there should be "show more" button
  - otherwise, there should be "show" button

Actions:
- Click on the author name should open author's profile (to be defined)(TODO: add link once defined)
- Click on the book name should open book on the position of the comment
- Click on the "show more"/"show" button should open comment section with that comment highlighted

---
Feed prioritization logic have to be defined. Prioritization should consider:
- Threads in which user participate (commented or voted)
- Threads under user's current book
- Threads under user's finished books
- Threads in which user's friends participate
- Threads in which celebrities participate
- Just popular threads in general

---
Other features:
- Hide spoilers