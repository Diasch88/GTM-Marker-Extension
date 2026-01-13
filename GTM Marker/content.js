// -------------------------
// GTM SPA Marker Script – Tags, Trigger, Variables
// -------------------------

// -------------------------
// Historien
// -------------------------
let lastTagHistory = [];
let lastTriggerHistory = [];
let lastVariableHistory = [];

// -------------------------
// CSS Klassen
// -------------------------
const classes = {
  tag: ['gtm-last-open-tag', 'gtm-second-last-open-tag', 'gtm-third-last-open-tag'],
  trigger: ['gtm-last-open-trigger', 'gtm-second-last-open-trigger', 'gtm-third-last-open-trigger'],
  variable: ['gtm-last-open-variable', 'gtm-second-last-open-variable', 'gtm-third-last-open-variable']
};

// -------------------------
// Helfer: Aktuelle Sektion
// -------------------------
function getCurrentSection() {
  const path = window.location.hash || '';
  if (path.includes('/tags')) return 'tags';
  if (path.includes('/triggers')) return 'triggers';
  if (path.includes('/variables')) return 'variables';
  return null;
}

// -------------------------
// Listen bauen
// -------------------------
function buildTagList() {
  const rows = document.querySelectorAll('a.open-tag-button[data-ng-click]');
  return Array.from(rows).map(row => ({ name: row.textContent.trim(), element: row }));
}

function buildTriggerList() {
  const rows = document.querySelectorAll('a.wd-open-trigger-button[data-ng-click]');
  return Array.from(rows).map(row => ({ name: row.textContent.trim(), element: row }));
}

function buildVariableList() {
  const rows = document.querySelectorAll('a.wd-variable-name[data-ng-click]');
  return Array.from(rows).map(row => ({ name: row.textContent.trim(), element: row }));
}

// -------------------------
// Marker setzen
// -------------------------
function highlightList(list, history, classSet) {
  if (!list || list.length === 0 || !history || history.length === 0) return;

  // Alte Klassen entfernen
  list.forEach(item => item.element.classList.remove(...classSet));

  // Historie durchgehen
  history.forEach((itemVal, index) => {
    if (!itemVal || !classSet[index]) return;
    const target = list.find(i => i.name === itemVal);
    if (target) {
      target.element.classList.add(classSet[index]);
    }
  });

  // Auf den neuesten scrollen (optional)
  const latest = list.find(i => i.name === history[0]);
  if (latest) {
    latest.element.scrollIntoView({ block: 'center' });
  }
}

// -------------------------
// Historie aktualisieren
// -------------------------
function updateHistory(historyArray, newValue, max = 3) {
  if (!newValue || historyArray[0] === newValue) return false;
  historyArray.unshift(newValue);
  if (historyArray.length > max) historyArray.pop();
  return true;
}

// -------------------------
// Offene Elemente auslesen
// -------------------------
function getOpenTagId() {
  const editor = document.querySelector('[name="tag.data.name"]');
  return editor ? editor.textContent.trim() : null;
}

function getOpenTriggerName() {
  const editor = document.querySelector('[name="trigger.data.name"]');
  return editor ? editor.textContent.trim() : null;
}

function getOpenVariableName() {
  const editor = document.querySelector('[name="variable.data.name"]');
  return editor ? editor.textContent.trim() : null;
}

// -------------------------
// Abschnitt-Update
// -------------------------
function handleSectionUpdate(section) {
  if (section === 'tags') {
    const tagId = getOpenTagId();
    if (updateHistory(lastTagHistory, tagId)) {
      const list = buildTagList();
      highlightList(list, lastTagHistory, classes.tag);
    }
  } else if (section === 'triggers') {
    const name = getOpenTriggerName();
    if (updateHistory(lastTriggerHistory, name)) {
      const list = buildTriggerList();
      highlightList(list, lastTriggerHistory, classes.trigger);
    }
  } else if (section === 'variables') {
    const name = getOpenVariableName();
    if (updateHistory(lastVariableHistory, name)) {
      const list = buildVariableList();
      highlightList(list, lastVariableHistory, classes.variable);
    }
  }
}

// Debounce für Updates, um viele schnelle Mutationen zu bündeln
let updateTimeout = null;
function scheduleSectionUpdate(section) {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => handleSectionUpdate(section), 100);
}

// -------------------------
// SPA Observer
// -------------------------
function observeGTMSection() {
  // Falls du einen spezifischeren Container kennst, hier einsetzen statt document.body
  const container = document.body;

  if (!container) return;

  const observer = new MutationObserver(mutations => {
    const section = getCurrentSection();
    if (!section) return;

    const hasAddedNodes = mutations.some(m => m.addedNodes && m.addedNodes.length > 0);
    if (!hasAddedNodes) return;

    scheduleSectionUpdate(section);
  });

  observer.observe(container, { childList: true, subtree: true });
  console.log('[GTM Marker] SPA-Observer gestartet.');
}

// -------------------------
// Initialisierung
// -------------------------
function initGTMMarker() {
  const section = getCurrentSection();
  console.log('[GTM Marker] Init, aktuelle Sektion:', section);

  if (section) {
    // Initialer Durchlauf, falls beim Laden schon ein Element offen ist
    handleSectionUpdate(section);
  }

  observeGTMSection();
}

// Starten
initGTMMarker();
