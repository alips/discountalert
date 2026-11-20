// options.js

let codes = [];
let editingIndex = -1;

document.addEventListener("DOMContentLoaded", load);

async function load() {
  const data = await browser.storage.local.get("codes");
  codes = data.codes || [];
  render();
}

function render() {
  const tbody = document.querySelector("#codes-table tbody");
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  codes.forEach((entry, i) => {
    const tr = document.createElement("tr");

    const tdDomain = document.createElement("td");
    tdDomain.textContent = entry.domain;

    const tdLabel = document.createElement("td");
    tdLabel.textContent = entry.label || "-";

    const tdCode = document.createElement("td");
    const codeEl = document.createElement("code");
    codeEl.textContent = entry.code;
    tdCode.appendChild(codeEl);

    const tdNotes = document.createElement("td");
    tdNotes.textContent = entry.notes || "-";

    const tdDel = document.createElement("td");
    const btn = document.createElement("button");
    btn.className = "btn btn-del";
    btn.textContent = "x";
    btn.addEventListener("click", () => {
      codes.splice(i, 1);
      save();
    });
    tdDel.appendChild(btn);

    tr.appendChild(tdDomain);
    tr.appendChild(tdLabel);
    tr.appendChild(tdCode);
    tr.appendChild(tdNotes);
    tr.appendChild(tdDel);

    tbody.appendChild(tr);
  });
}

async function save() {
  await browser.storage.local.set({ codes });
  render();
}

document.getElementById("btn-save").addEventListener("click", () => {
  const domain = document.getElementById("f-domain").value.trim().toLowerCase();
  const label = document.getElementById("f-label").value.trim();
  const code = document.getElementById("f-code").value.trim();
  const notes = document.getElementById("f-notes").value.trim();

  if (!domain || !code) {
    alert("Domain and Code are required.");
    return;
  }

  if (editingIndex >= 0) {
    codes[editingIndex] = { domain, label, code, notes };
    editingIndex = -1;
    document.getElementById("form-title").textContent = "Add a new code";
    document.getElementById("btn-save").textContent = "Add";
    document.getElementById("btn-cancel").style.display = "none";
  } else {
    codes.push({ domain, label, code, notes });
  }

  clearForm();
  save();
});

document.getElementById("btn-cancel").addEventListener("click", () => {
  editingIndex = -1;
  clearForm();
  document.getElementById("form-title").textContent = "Add a new code";
  document.getElementById("btn-save").textContent = "Add";
  document.getElementById("btn-cancel").style.display = "none";
});

function clearForm() {
  document.getElementById("f-domain").value = "";
  document.getElementById("f-label").value = "";
  document.getElementById("f-code").value = "";
  document.getElementById("f-notes").value = "";
}