export function renderPage(images: string[], lastRead: string | null, folderName: string): string {
  const imageJson = JSON.stringify(images);
  const lastReadJson = JSON.stringify(lastRead);
  const title = `ima — ${escapeHtml(folderName)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: #111;
      color: #e8e8e8;
      min-height: 100vh;
    }

    header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #2a2a2a;
    }

    header h1 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li button {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.75rem 1.5rem;
      border: none;
      border-bottom: 1px solid #1e1e1e;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }

    li button:hover,
    li button:focus-visible {
      background: #1c1c1c;
      outline: none;
    }

    li.pinned button {
      background: #1a2332;
      border-bottom-color: #243044;
    }

    li.pinned button:hover,
    li.pinned button:focus-visible {
      background: #1f2a3d;
    }

    li.pinned .tag {
      margin-left: 0.5rem;
      font-size: 0.75rem;
      color: #7aa2d6;
    }

    #viewer {
      display: none;
      position: fixed;
      inset: 0;
      background: #000;
      z-index: 10;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    #viewer.open {
      display: flex;
    }

    #viewer img {
      max-width: 100vw;
      max-height: 100vh;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <header>
    <h1>${images.length} image${images.length === 1 ? "" : "s"}</h1>
  </header>
  <ul id="list"></ul>

  <div id="viewer" aria-hidden="true">
    <img id="preview" alt="">
  </div>

  <script>
    const images = ${imageJson};
    const lastRead = ${lastReadJson};
    const list = document.getElementById("list");
    const viewer = document.getElementById("viewer");
    const preview = document.getElementById("preview");
    let currentIndex = -1;
    let pinnedLastRead = lastRead;
    let pinnedLi = null;

    function addListItem(name, index) {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = name;
      button.addEventListener("click", () => openViewer(index));
      li.appendChild(button);
      list.appendChild(li);
    }

    function updatePinnedRow(name) {
      if (name === pinnedLastRead && pinnedLi) {
        return;
      }

      pinnedLastRead = name;
      const index = images.indexOf(name);
      if (index === -1) {
        return;
      }

      if (!pinnedLi) {
        pinnedLi = document.createElement("li");
        pinnedLi.className = "pinned";
        list.insertBefore(pinnedLi, list.firstChild);
      }

      pinnedLi.replaceChildren();
      const button = document.createElement("button");
      button.type = "button";
      button.append(document.createTextNode(name + " "));
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = "last read";
      button.append(tag);
      button.addEventListener("click", () => openViewer(index));
      pinnedLi.append(button);
    }

    images.forEach((name, index) => {
      addListItem(name, index);
    });

    if (lastRead) {
      updatePinnedRow(lastRead);
    }

    function saveLastRead(name) {
      fetch("/api/last-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: name }),
      });
    }

    function openViewer(index) {
      currentIndex = index;
      showImage();
      viewer.classList.add("open");
      viewer.setAttribute("aria-hidden", "false");
    }

    function closeViewer() {
      viewer.classList.remove("open");
      viewer.setAttribute("aria-hidden", "true");
      currentIndex = -1;
    }

    function showImage() {
      const name = images[currentIndex];
      preview.src = "/image/" + encodeURIComponent(name);
      preview.alt = name;
      updatePinnedRow(name);
      saveLastRead(name);
    }

    function goPrev() {
      if (currentIndex <= 0) return;
      currentIndex--;
      showImage();
    }

    function goNext() {
      if (currentIndex >= images.length - 1) return;
      currentIndex++;
      showImage();
    }

    document.addEventListener("keydown", (event) => {
      if (currentIndex === -1) return;

      if (event.key === "Escape") {
        closeViewer();
        return;
      }

      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        if (event.shiftKey) {
          goPrev();
        } else {
          goNext();
        }
      }
    });
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
