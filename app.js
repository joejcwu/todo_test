(() => {
  "use strict";

  const storageKey = "todo-test.tasks.v1";
  const form = document.querySelector("#task-form");
  const taskInput = document.querySelector("#task-input");
  const list = document.querySelector("#task-list");
  const emptyState = document.querySelector("#empty-state");
  const remainingCount = document.querySelector("#remaining-count");
  const storageNotice = document.querySelector("#storage-notice");
  const clearCompleted = document.querySelector("#clear-completed");
  const filterButtons = [...document.querySelectorAll("[data-filter]")];

  let tasks = [];
  let filter = "all";
  let editingId = null;
  let storageAvailable = true;

  function showStorageNotice() {
    storageAvailable = false;
    storageNotice.hidden = false;
  }

  function loadTasks() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === null) return;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || !parsed.every(task =>
        task && typeof task.id === "string" && typeof task.title === "string" &&
        typeof task.completed === "boolean" && typeof task.createdAt === "number"
      )) {
        throw new Error("Invalid saved tasks");
      }
      tasks = parsed;
    } catch (_) {
      showStorageNotice();
    }
  }

  function saveTasks() {
    if (!storageAvailable) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch (_) {
      showStorageNotice();
    }
  }

  function createButton(text, className, onClick, accessibleName) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = text;
    if (accessibleName) button.setAttribute("aria-label", accessibleName);
    button.addEventListener("click", onClick);
    return button;
  }

  function focusAfterTaskAction(taskId, controlSelector) {
    const row = [...list.children].find(item => item.dataset.taskId === taskId);
    const control = row && controlSelector && row.querySelector(controlSelector);
    (control || filterButtons.find(button => button.dataset.filter === filter)).focus();
  }

  function renderEdit(row, task) {
    const editForm = document.createElement("form");
    editForm.className = "edit-form";
    const label = document.createElement("label");
    const input = document.createElement("input");
    const inputId = `edit-${task.id}`;
    label.htmlFor = inputId;
    label.textContent = "Edit task";
    input.id = inputId;
    input.type = "text";
    input.value = task.title;
    input.autocomplete = "off";

    function cancel() {
      editingId = null;
      render();
      focusAfterTaskAction(task.id, ".edit-button");
    }

    editForm.addEventListener("submit", event => {
      event.preventDefault();
      const title = input.value.trim();
      if (!title) {
        input.focus();
        return;
      }
      task.title = title;
      editingId = null;
      saveTasks();
      render();
      focusAfterTaskAction(task.id, ".edit-button");
    });
    input.addEventListener("keydown", event => {
      if (event.key === "Escape") cancel();
    });
    const save = document.createElement("button");
    save.type = "submit";
    save.textContent = "Save";
    editForm.append(label, input, save, createButton("Cancel", "cancel-button", cancel));
    row.append(editForm);
    requestAnimationFrame(() => {
      input.focus();
      input.select();
    });
  }

  function renderTask(task) {
    const row = document.createElement("li");
    row.dataset.taskId = task.id;
    row.className = task.completed ? "task-item is-complete" : "task-item";
    if (editingId === task.id) {
      renderEdit(row, task);
      return row;
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete task: ${task.title}`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      render();
      focusAfterTaskAction(task.id, 'input[type="checkbox"]');
    });

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const actions = document.createElement("div");
    actions.className = "task-actions";
    actions.append(
      createButton("Edit", "edit-button", () => {
        editingId = task.id;
        render();
      }, `Edit task: ${task.title}`),
      createButton("Delete", "delete-button", () => {
        tasks = tasks.filter(item => item.id !== task.id);
        if (editingId === task.id) editingId = null;
        saveTasks();
        render();
        focusAfterTaskAction(task.id);
      }, `Delete task: ${task.title}`)
    );
    row.append(checkbox, title, actions);
    return row;
  }

  function render() {
    const visible = tasks.filter(task =>
      filter === "all" || (filter === "active" ? !task.completed : task.completed)
    );
    list.replaceChildren(...visible.map(renderTask));
    const remaining = tasks.filter(task => !task.completed).length;
    remainingCount.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} remaining`;
    emptyState.textContent = tasks.length === 0
      ? "Your list is clear. Add a task to get started."
      : visible.length === 0
        ? filter === "active" ? "No active tasks right now." : "No completed tasks yet."
        : "";
    emptyState.hidden = visible.length > 0;
    clearCompleted.disabled = !tasks.some(task => task.completed);
    for (const button of filterButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
    }
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const title = taskInput.value.trim();
    if (!title) {
      taskInput.focus();
      return;
    }
    tasks.push({ id: crypto.randomUUID(), title, completed: false, createdAt: Date.now() });
    taskInput.value = "";
    saveTasks();
    render();
    taskInput.focus();
  });

  for (const button of filterButtons) {
    button.addEventListener("click", () => {
      filter = button.dataset.filter;
      editingId = null;
      render();
    });
  }

  clearCompleted.addEventListener("click", () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    render();
  });

  loadTasks();
  render();
})();
