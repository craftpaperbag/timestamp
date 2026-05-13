(() => {
  "use strict";

  const STORAGE = {
    records: "timestamp.records",
    titles: "timestamp.titles",
    defaultTitle: "timestamp.defaultTitle",
    theme: "timestamp.theme",
    seenIntro: "timestamp.seenIntro",
  };

  const SESSION_KEY_AUTO_RECORDED = "timestamp.autoRecorded";

  const DEFAULT_TITLES = ["頭痛薬", "コーヒー", "目薬"];

  const state = {
    records: [],
    titles: [],
    defaultTitle: "",
    theme: "auto",
  };

  const els = {
    titleButtons: document.getElementById("title-buttons"),
    titleEmpty: document.getElementById("title-empty"),
    historyList: document.getElementById("history-list"),
    historyEmpty: document.getElementById("history-empty"),
    historyCount: document.getElementById("history-count"),
    toast: document.getElementById("toast"),
    settingsDialog: document.getElementById("settings-dialog"),
    manualDialog: document.getElementById("manual-dialog"),
    editDialog: document.getElementById("edit-dialog"),
    editForm: document.getElementById("edit-form"),
    infoDialog: document.getElementById("info-dialog"),
    confirmDialog: document.getElementById("confirm-dialog"),
    confirmMessage: document.getElementById("confirm-message"),
    titlesList: document.getElementById("titles-list"),
    titleAddInput: document.getElementById("title-add-input"),
    themeRadios: document.querySelectorAll('input[name="theme"]'),
  };

  // ---- storage helpers ----
  const load = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const save = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn("storage failed", err);
      showToast("保存に失敗しました");
    }
  };

  // ---- utilities ----
  const uid = () =>
    `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const orderedTitles = () => {
    const def = state.defaultTitle;
    if (!def || !state.titles.includes(def)) return state.titles.slice();
    return [def, ...state.titles.filter((t) => t !== def)];
  };

  const swapTitles = (i, j) => {
    if (i < 0 || j < 0 || i >= state.titles.length || j >= state.titles.length) {
      return;
    }
    const next = state.titles.slice();
    [next[i], next[j]] = [next[j], next[i]];
    state.titles = next;
    save(STORAGE.titles, state.titles);
    renderTitlesList();
    renderTitleButtons();
  };

  const setDefaultTitle = (title) => {
    state.defaultTitle = title && state.titles.includes(title) ? title : "";
    save(STORAGE.defaultTitle, state.defaultTitle);
    renderTitlesList();
    renderTitleButtons();
  };

  const clearDefaultIfMissing = () => {
    if (state.defaultTitle && !state.titles.includes(state.defaultTitle)) {
      state.defaultTitle = "";
      save(STORAGE.defaultTitle, state.defaultTitle);
    }
  };

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(d);
  };

  const toLocalInputValue = (iso) => {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    );
  };

  const fromLocalInputValue = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  };

  let toastTimer = 0;
  const showToast = (message, { variant } = {}) => {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.remove("toast--prominent");
    if (variant === "prominent") {
      els.toast.classList.add("toast--prominent");
    }
    els.toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      els.toast.hidden = true;
    }, 2200);
  };

  // ---- theme ----
  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
  };

  // ---- rendering ----
  const renderTitleButtons = () => {
    els.titleButtons.replaceChildren();
    if (state.titles.length === 0) {
      els.titleEmpty.hidden = false;
      return;
    }
    els.titleEmpty.hidden = true;
    for (const title of orderedTitles()) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "title-button";
      if (title === state.defaultTitle) {
        btn.classList.add("title-button--default");
      }
      btn.textContent = title;
      btn.setAttribute("aria-label", `${title} を記録`);
      btn.addEventListener("click", () => {
        recordTitle(title, "manual");
        if (els.manualDialog && els.manualDialog.open) {
          els.manualDialog.close();
        }
      });
      els.titleButtons.appendChild(btn);
    }
  };

  const renderHistory = () => {
    els.historyList.replaceChildren();
    els.historyCount.textContent = `${state.records.length}件`;
    if (state.records.length === 0) {
      els.historyEmpty.hidden = false;
      return;
    }
    els.historyEmpty.hidden = true;
    const sorted = [...state.records].sort(
       (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
    );
    for (const rec of sorted) {
      const li = document.createElement("li");
      li.className = "history-item";

      const title = document.createElement("div");
      title.className = "history-item__title";
      const titleText = document.createElement("span");
      titleText.className = "history-item__title-text";
      titleText.textContent = rec.title;
      title.appendChild(titleText);
      if (rec.source === "auto") {
        const badge = document.createElement("span");
        badge.className = "badge badge--auto";
        badge.textContent = "自動";
        badge.setAttribute("aria-label", "自動で記録された項目");
        title.appendChild(badge);
      }

      const time = document.createElement("div");
      time.className = "history-item__time";
      time.textContent = formatDateTime(rec.at);

      const actions = document.createElement("div");
      actions.className = "history-item__actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn--small";
      editBtn.textContent = "編集";
      editBtn.setAttribute("aria-label", `${rec.title} の記録を編集`);
      editBtn.addEventListener("click", () => openEdit(rec.id));

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn--small btn--danger";
      deleteBtn.textContent = "削除";
      deleteBtn.setAttribute("aria-label", `${rec.title} の記録を削除`);
      deleteBtn.addEventListener("click", () => confirmDelete(rec.id));

      actions.append(editBtn, deleteBtn);
      li.append(title, time, actions);
      els.historyList.appendChild(li);
    }
  };

  const renderTitlesList = () => {
    els.titlesList.replaceChildren();
    if (state.titles.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-note";
      li.textContent = "タイトルがありません。追加してください。";
      els.titlesList.appendChild(li);
      return;
    }

    const noneLi = document.createElement("li");
    noneLi.className = "title-row title-row--none";
    const noneLabel = document.createElement("label");
    noneLabel.className = "title-row__default";
    const noneRadio = document.createElement("input");
    noneRadio.type = "radio";
    noneRadio.name = "default-title";
    noneRadio.value = "";
    noneRadio.checked = !state.defaultTitle;
    noneRadio.addEventListener("change", () => {
      if (noneRadio.checked) setDefaultTitle("");
    });
    const noneText = document.createElement("span");
    noneText.className = "title-row__default-text";
    noneText.textContent = "デフォルトなし";
    noneLabel.append(noneRadio, noneText);
    noneLi.appendChild(noneLabel);
    els.titlesList.appendChild(noneLi);

    for (const title of orderedTitles()) {
      const index = state.titles.indexOf(title);
      const li = document.createElement("li");
      li.className = "title-row";
      if (title === state.defaultTitle) li.classList.add("title-row--default");

      const defaultLabel = document.createElement("label");
      defaultLabel.className = "title-row__default";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "default-title";
      radio.value = title;
      radio.checked = title === state.defaultTitle;
      radio.setAttribute("aria-label", `${title} をデフォルトに設定`);
      radio.addEventListener("change", () => {
        if (radio.checked) setDefaultTitle(title);
      });
      const defaultText = document.createElement("span");
      defaultText.className = "visually-hidden";
      defaultText.textContent = "デフォルト";
      defaultLabel.append(radio, defaultText);

      const input = document.createElement("input");
      input.type = "text";
      input.className = "title-edit-input";
      input.value = title;
      input.maxLength = 32;
      input.setAttribute("aria-label", `タイトル ${index + 1}`);
      input.addEventListener("change", () => {
        const next = input.value.trim();
        if (!next) {
          input.value = state.titles[index];
          showToast("空のタイトルは保存できません");
          return;
        }
        if (state.titles.some((t, i) => i !== index && t === next)) {
          input.value = state.titles[index];
          showToast("同じタイトルが既にあります");
          return;
        }
        const prev = state.titles[index];
        state.titles[index] = next;
        save(STORAGE.titles, state.titles);
        if (state.defaultTitle === prev) {
          state.defaultTitle = next;
          save(STORAGE.defaultTitle, state.defaultTitle);
        }
        renderTitlesList();
        renderTitleButtons();
      });

      const upBtn = document.createElement("button");
      upBtn.type = "button";
      upBtn.className = "btn btn--small title-row__reorder";
      upBtn.textContent = "↑";
      upBtn.setAttribute("aria-label", `${title} を上へ`);
      upBtn.disabled = index <= 0;
      upBtn.addEventListener("click", () => swapTitles(index, index - 1));

      const downBtn = document.createElement("button");
      downBtn.type = "button";
      downBtn.className = "btn btn--small title-row__reorder";
      downBtn.textContent = "↓";
      downBtn.setAttribute("aria-label", `${title} を下へ`);
      downBtn.disabled = index >= state.titles.length - 1;
      downBtn.addEventListener("click", () => swapTitles(index, index + 1));

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "btn btn--small btn--danger";
      removeBtn.textContent = "削除";
      removeBtn.setAttribute("aria-label", `${title} を削除`);
      removeBtn.addEventListener("click", () => {
        const removed = state.titles[index];
        state.titles.splice(index, 1);
        save(STORAGE.titles, state.titles);
        if (state.defaultTitle === removed) {
          state.defaultTitle = "";
          save(STORAGE.defaultTitle, state.defaultTitle);
        }
        renderTitlesList();
        renderTitleButtons();
      });

      li.append(defaultLabel, input, upBtn, downBtn, removeBtn);
      els.titlesList.appendChild(li);
    }
  };

  const renderThemeRadios = () => {
    for (const r of els.themeRadios) {
      r.checked = r.value === state.theme;
    }
  };

  // ---- actions ----
  const recordTitle = (title, source = "manual") => {
    const record = {
      id: uid(),
      title,
      at: new Date().toISOString(),
      source,
    };
    state.records.push(record);
    save(STORAGE.records, state.records);
    renderHistory();
    showToast(
      source === "auto"
        ? `自動で記録しました: ${title}`
        : `記録しました: ${title}`,
      source === "auto" ? { variant: "prominent" } : undefined
    );
  };

  const openEdit = (id) => {
    const rec = state.records.find((r) => r.id === id);
    if (!rec) return;
    els.editForm.elements.id.value = rec.id;
    els.editForm.elements.title.value = rec.title;
    els.editForm.elements.at.value = toLocalInputValue(rec.at);
    els.editDialog.showModal();
    window.requestAnimationFrame(() => {
      els.editForm.elements.title.focus();
    });
  };

  const handleEditSubmit = (event) => {
    if (event.submitter && event.submitter.value !== "save") return;
    const data = new FormData(els.editForm);
    const id = data.get("id");
    const title = String(data.get("title") || "").trim();
    const atIso = fromLocalInputValue(String(data.get("at") || ""));
    if (!id || !title || !atIso) {
      event.preventDefault();
      showToast("入力内容を確認してください");
      return;
    }
    const idx = state.records.findIndex((r) => r.id === id);
    if (idx < 0) return;
    state.records[idx] = { ...state.records[idx], title, at: atIso };
    save(STORAGE.records, state.records);
    renderHistory();
    showToast("記録を更新しました");
  };

  const openConfirm = (message) =>
    new Promise((resolve) => {
      els.confirmMessage.textContent = message;
      const handler = () => {
        els.confirmDialog.removeEventListener("close", handler);
        resolve(els.confirmDialog.returnValue === "ok");
      };
      els.confirmDialog.addEventListener("close", handler);
      els.confirmDialog.returnValue = "";
      els.confirmDialog.showModal();
    });

  const confirmDelete = async (id) => {
    const rec = state.records.find((r) => r.id === id);
    if (!rec) return;
    const ok = await openConfirm(
      `「${rec.title}」(${formatDateTime(rec.at)}) を削除します。よろしいですか?`
    );
    if (!ok) return;
    state.records = state.records.filter((r) => r.id !== id);
    save(STORAGE.records, state.records);
    renderHistory();
    showToast("削除しました");
  };

  const deleteAll = async () => {
    if (state.records.length === 0) {
      showToast("削除する記録がありません");
      return;
    }
    const ok = await openConfirm(
      `${state.records.length}件の記録をすべて削除します。元に戻せません。`
    );
    if (!ok) return;
    state.records = [];
    save(STORAGE.records, state.records);
    renderHistory();
    showToast("すべて削除しました");
  };

  const exportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      records: state.records,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `timestamp-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("JSONを書き出しました");
  };

  const addTitle = () => {
    const value = els.titleAddInput.value.trim();
    if (!value) {
      showToast("タイトルを入力してください");
      return;
    }
    if (state.titles.includes(value)) {
      showToast("同じタイトルが既にあります");
      return;
    }
    state.titles.push(value);
    save(STORAGE.titles, state.titles);
    els.titleAddInput.value = "";
    renderTitlesList();
    renderTitleButtons();
  };

  // ---- auto record ----
  const maybeAutoRecord = () => {
    let already = null;
    try {
      already = sessionStorage.getItem(SESSION_KEY_AUTO_RECORDED);
    } catch {
      return;
    }
    if (already) return;
    if (!state.defaultTitle || !state.titles.includes(state.defaultTitle)) {
      return;
    }
    try {
      sessionStorage.setItem(SESSION_KEY_AUTO_RECORDED, "1");
    } catch {
      return;
    }
    recordTitle(state.defaultTitle, "auto");
  };

  // ---- event wiring ----
  const wire = () => {
    document.body.addEventListener("click", (event) => {
      const target = event.target.closest("[data-action]");
      if (!target) return;
      const action = target.dataset.action;
      switch (action) {
        case "open-settings":
          renderTitlesList();
          renderThemeRadios();
          els.settingsDialog.showModal();
          break;
        case "open-manual":
          renderTitleButtons();
          if (els.manualDialog) els.manualDialog.showModal();
          break;
        case "open-info":
          els.infoDialog.showModal();
          break;
        case "close-dialog": {
          const dialog = target.closest("dialog");
          if (dialog) dialog.close();
          break;
        }
        case "add-title":
          addTitle();
          break;
        case "export-json":
          exportJson();
          break;
        case "delete-all":
          deleteAll();
          break;
      }
    });

    els.titleAddInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addTitle();
      }
    });

    for (const radio of els.themeRadios) {
      radio.addEventListener("change", () => {
        if (!radio.checked) return;
        state.theme = radio.value;
        save(STORAGE.theme, state.theme);
        applyTheme(state.theme);
      });
    }

    els.editForm.addEventListener("submit", handleEditSubmit);
  };

  // ---- bootstrap ----
  const init = () => {
    state.records = load(STORAGE.records, []);
    const savedTitles = load(STORAGE.titles, null);
    state.titles = Array.isArray(savedTitles) ? savedTitles : DEFAULT_TITLES.slice();
    if (savedTitles == null) save(STORAGE.titles, state.titles);
    const savedDefault = load(STORAGE.defaultTitle, "");
    state.defaultTitle = typeof savedDefault === "string" ? savedDefault : "";
    clearDefaultIfMissing();
    state.theme = load(STORAGE.theme, "auto");
    applyTheme(state.theme);

    renderTitleButtons();
    renderHistory();
    wire();
    maybeAutoRecord();

    if (!load(STORAGE.seenIntro, false)) {
      els.infoDialog.showModal();
      save(STORAGE.seenIntro, true);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
