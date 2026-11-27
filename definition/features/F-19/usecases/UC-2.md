---
id: UC-2
title: Host a design document in the composite designer
---

**Actor:** a host application (for example the MockItDown Designer's desktop shell).

**Precondition:** the host has read a design document from a file.

1. The host places the composite designer on its page and opens the document in it.
2. The designer selects an element and deletes it.
3. The host receives one change notification with the text edits and marks the document edited.
4. The host asks the composite designer for the document and writes it to the file.
5. The host later opens the written file in the composite designer again.

**Outcome:** the reopened document shows the mockups as they were saved, without the deleted element, and every
other part of the document, including keys the designer does not know, is unchanged.
