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

    const tdActions = document.createElement("td");

    const btnEdit = document.createElement("button");
    btnEdit.className = "btn btn-edit";
    btnEdit.textContent = "Edit";
    btnEdit.style.marginRight = "4px";
    btnEdit.addEventListener("click", () => startEdit(i));
    tdActions.appendChild(btnEdit);

    const btnDel = document.createElement("button");
    btnDel.className = "btn btn-del";
    btnDel.textContent = "x";
    btnDel.addEventListener("click", () => {
      codes.splice(i, 1);
      save();
    });
    tdActions.appendChild(btnDel);

    tr.appendChild(tdDomain);
    tr.appendChild(tdLabel);
    tr.appendChild(tdCode);
    tr.appendChild(tdNotes);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
}

function startEdit(i) {
  editingIndex = i;
  const entry = codes[i];
  document.getElementById("f-domain").value = entry.domain;
  document.getElementById("f-label").value = entry.label || "";
  document.getElementById("f-code").value = entry.code;
  document.getElementById("f-notes").value = entry.notes || "";
  document.getElementById("form-title").textContent = "Edit code";
  document.getElementById("btn-save").textContent = "Save";
  document.getElementById("btn-cancel").style.display = "inline-block";
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

// --- Export CSV ---

document.getElementById("btn-export").addEventListener("click", () => {
  const rows = [["domain", "label", "code", "notes"]];
  codes.forEach((e) => rows.push([e.domain, e.label || "", e.code, e.notes || ""]));

  const csv = rows.map((row) =>
    row.map((field) => `"${field.replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "discount-codes.csv";
  a.click();
  URL.revokeObjectURL(url);
});

// --- Import CSV ---

document.getElementById("btn-import").addEventListener("click", () => {
  document.getElementById("file-input").click();
});

document.getElementById("file-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const lines = reader.result.split("\n").filter((l) => l.trim());
    const start = lines[0].toLowerCase().includes("domain") ? 1 : 0;

    for (let i = start; i < lines.length; i++) {
      const fields = parseCsvLine(lines[i]);
      if (fields.length >= 2 && fields[0] && fields[2]) {
        const domain = fields[0].toLowerCase().trim();
        const existing = codes.findIndex((c) => c.domain === domain);
        const entry = {
          domain: domain,
          label: fields[1] || "",
          code: fields[2].trim(),
          notes: fields[3] || ""
        };
        if (existing >= 0) {
          codes[existing] = entry;
        } else {
          codes.push(entry);
        }
      }
    }

    save();
    alert("Import complete. " + codes.length + " codes total.");
  };
  reader.readAsText(file);
  e.target.value = "";
});

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}
