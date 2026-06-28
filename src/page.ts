export function renderPage(
  images: string[],
  lastRead: string | null,
  dualMode: boolean,
  dualOrientation: "ltr" | "rtl",
  folderName: string,
): string {
  const imageJson = JSON.stringify(images);
  const lastReadJson = JSON.stringify(lastRead);
  const dualModeJson = JSON.stringify(dualMode);
  const dualOrientationJson = JSON.stringify(dualOrientation);
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

    [hidden] {
      display: none !important;
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

    li.selected button {
      background: #252525;
      outline: 1px solid #555;
    }

    li.pinned.selected button {
      background: #1f2a3d;
      outline: 1px solid #7aa2d6;
    }

    li.selected button:hover,
    li.selected button:focus-visible {
      background: #2a2a2a;
    }

    li.pinned.selected button:hover,
    li.pinned.selected button:focus-visible {
      background: #243044;
    }

    #viewer-page {
      min-height: 100vh;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #viewer-page.dual {
      align-items: stretch;
    }

    .viewer-pane {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      min-width: 0;
    }

    #viewer-page.dual .viewer-pane {
      flex: 1;
    }

    #viewer-page:not(.dual) .viewer-pane-right {
      display: none;
    }

    #viewer-page:not(.dual) .viewer-pane-left {
      width: 100%;
    }

    #viewer-page img {
      max-width: 100%;
      max-height: 100vh;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <div id="list-page">
    <header>
      <h1>${images.length} image${images.length === 1 ? "" : "s"}</h1>
    </header>
    <ul id="list"></ul>
  </div>

  <div id="viewer-page" hidden>
    <div class="viewer-pane viewer-pane-left">
      <img id="preview" alt="">
    </div>
    <div class="viewer-pane viewer-pane-right">
      <img id="preview-right" alt="" hidden>
    </div>
  </div>

  <script>
    const images = ${imageJson};
    const lastRead = ${lastReadJson};
    const listPage = document.getElementById("list-page");
    const viewerPage = document.getElementById("viewer-page");
    const list = document.getElementById("list");
    const preview = document.getElementById("preview");
    const previewRight = document.getElementById("preview-right");
    let currentIndex = -1;
    let listFocusIndex = -1;
    let pinnedLastRead = lastRead;
    let pinnedLi = null;
    let dualMode = ${dualModeJson};
    let dualOrientation = ${dualOrientationJson};

    function viewerUrl(filename) {
      return "/view/" + encodeURIComponent(filename);
    }

    function parseRoute() {
      const path = location.pathname;
      if (path.startsWith("/view/")) {
        return { page: "viewer", filename: decodeURIComponent(path.slice("/view/".length)) };
      }
      return { page: "list" };
    }

    function getListItems() {
      return [...list.querySelectorAll("li")];
    }

    function setListSelection(index) {
      const items = getListItems();
      if (index < 0 || index >= items.length) {
        return;
      }

      listFocusIndex = index;
      items.forEach((li, i) => {
        li.classList.toggle("selected", i === index);
      });
      items[index].scrollIntoView({ block: "nearest" });
    }

    function selectListItemByFilename(filename) {
      const items = getListItems();
      const index = items.findIndex((li) => li.dataset.filename === filename);
      if (index !== -1) {
        setListSelection(index);
      } else if (items.length) {
        setListSelection(0);
      }
    }

    function initListSelection(filename) {
      if (filename) {
        selectListItemByFilename(filename);
        return;
      }

      const items = getListItems();
      if (items.length) {
        setListSelection(0);
      } else {
        listFocusIndex = -1;
      }
    }

    function moveListSelection(delta) {
      const items = getListItems();
      if (!items.length) {
        return;
      }

      if (listFocusIndex === -1) {
        setListSelection(delta > 0 ? 0 : items.length - 1);
        return;
      }

      const next = listFocusIndex + delta;
      if (next < 0 || next >= items.length) {
        return;
      }

      setListSelection(next);
    }

    function openSelectedInViewer() {
      const items = getListItems();
      if (listFocusIndex < 0 || listFocusIndex >= items.length) {
        return;
      }

      const filename = items[listFocusIndex].dataset.filename;
      if (filename) {
        openViewer(filename);
      }
    }

    function addListItem(name, index) {
      const li = document.createElement("li");
      li.dataset.filename = name;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = name;
      button.addEventListener("click", () => {
        setListSelection(getListItems().indexOf(li));
        openViewer(name);
      });
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

      pinnedLi.dataset.filename = name;
      pinnedLi.replaceChildren();
      const button = document.createElement("button");
      button.type = "button";
      button.append(document.createTextNode(name + " "));
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = "last read";
      button.append(tag);
      button.addEventListener("click", () => {
        setListSelection(getListItems().indexOf(pinnedLi));
        openViewer(name);
      });
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

    function saveDualMode(enabled) {
      fetch("/api/dual-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dualMode: enabled }),
      });
    }

    function saveDualOrientation(orientation) {
      fetch("/api/dual-orientation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orientation }),
      });
    }

    function setPaneImage(imgEl, index) {
      if (index >= 0 && index < images.length) {
        imgEl.hidden = false;
        imgEl.src = "/image/" + encodeURIComponent(images[index]);
        imgEl.alt = images[index];
      } else {
        imgEl.hidden = true;
        imgEl.removeAttribute("src");
        imgEl.alt = "";
      }
    }

    function applyViewerLayout() {
      viewerPage.classList.toggle("dual", dualMode);

      if (!dualMode) {
        setPaneImage(preview, currentIndex);
        previewRight.hidden = true;
        previewRight.removeAttribute("src");
        previewRight.alt = "";
        return;
      }

      const leading = currentIndex;
      const trailing = currentIndex + 1;

      if (dualOrientation === "ltr") {
        setPaneImage(preview, leading);
        setPaneImage(previewRight, trailing);
      } else {
        setPaneImage(previewRight, leading);
        setPaneImage(preview, trailing);
      }
    }

    function setDualOrientation(orientation) {
      dualOrientation = orientation;
      saveDualOrientation(orientation);
      applyViewerLayout();
    }

    function toggleDualMode() {
      dualMode = !dualMode;
      saveDualMode(dualMode);
      applyViewerLayout();
    }

    function showListPage(selectFilename) {
      listPage.hidden = false;
      viewerPage.hidden = true;
      currentIndex = -1;
      initListSelection(selectFilename ?? pinnedLastRead ?? lastRead);
    }

    function showViewerPage(filename, pushHistory) {
      const index = images.indexOf(filename);
      if (index === -1) {
        showListPage();
        if (location.pathname !== "/") {
          history.replaceState({ page: "list" }, "", "/");
        }
        return;
      }

      currentIndex = index;
      listPage.hidden = true;
      viewerPage.hidden = false;
      applyViewerLayout();
      updatePinnedRow(filename);
      saveLastRead(filename);

      if (pushHistory) {
        history.pushState({ page: "viewer", filename }, "", viewerUrl(filename));
      }
    }

    function openViewer(filename) {
      showViewerPage(filename, true);
    }

    function goStep(delta) {
      const next = currentIndex + delta;
      if (next < 0 || next >= images.length) {
        return;
      }
      showViewerPage(images[next], true);
    }

    function goSpread(delta) {
      const step = dualMode ? 2 : 1;
      goStep(delta * step);
    }

    function onPopState() {
      const route = parseRoute();
      if (route.page === "viewer") {
        showViewerPage(route.filename, false);
      } else {
        showListPage(pinnedLastRead ?? lastRead);
      }
    }

    window.addEventListener("popstate", onPopState);

    document.addEventListener("keydown", (event) => {
      if (!viewerPage.hidden) {
        if (event.key === "Escape") {
          const filename = currentIndex >= 0 ? images[currentIndex] : null;
          showListPage(filename);
          history.pushState({ page: "list" }, "", "/");
          return;
        }

        if (event.key === "v") {
          event.preventDefault();
          toggleDualMode();
          return;
        }

        if (dualMode && event.key === ">") {
          event.preventDefault();
          setDualOrientation("ltr");
          return;
        }

        if (dualMode && event.key === "<") {
          event.preventDefault();
          setDualOrientation("rtl");
          return;
        }

        if (event.key === "[") {
          event.preventDefault();
          goStep(-1);
          return;
        }

        if (event.key === "]") {
          event.preventDefault();
          goStep(1);
          return;
        }

        if (event.key === "ArrowUp" || event.key === "ArrowLeft" || event.key === "k") {
          event.preventDefault();
          goSpread(-1);
          return;
        }

        if (event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "j") {
          event.preventDefault();
          goSpread(1);
          return;
        }

        if (event.key === " ") {
          event.preventDefault();
          if (event.shiftKey) {
            goSpread(-1);
          } else {
            goSpread(1);
          }
        }
        return;
      }

      if (event.key === "ArrowUp" || event.key === "k") {
        event.preventDefault();
        moveListSelection(-1);
        return;
      }

      if (event.key === "ArrowDown" || event.key === "j") {
        event.preventDefault();
        moveListSelection(1);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        openSelectedInViewer();
      }
    });

    const initialRoute = parseRoute();
    if (initialRoute.page === "viewer") {
      showViewerPage(initialRoute.filename, false);
    } else {
      showListPage();
    }
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
