# Personal Todo List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a responsive personal todo list at `https://joejcwu.github.io/todo_test/`.

**Architecture:** A dependency-free page uses semantic HTML and browser JavaScript, with task state stored in `localStorage`. A GitHub Actions workflow stages only the app files and deploys them to GitHub Pages on pushes to `main`.

**Tech Stack:** HTML, CSS, browser JavaScript, GitHub Pages Actions, Python 3.12 with the environment's Playwright/Chromium for browser checks.

**Spec:** `docs/superpowers/specs/2026-10-14-personal-todo-list-design.md`

## Global Constraints

- Use plain HTML, CSS, and JavaScript with no runtime or package dependencies.
- Keep the interface in English and store tasks in browser `localStorage`; do not add accounts or cross-device sync.
- Store each task as `{ id, title, completed, createdAt }` under `todo-test.tasks.v1`.
- Use relative asset paths for the project Pages URL `https://joejcwu.github.io/todo_test/`.
- Publish only `index.html`, `styles.css`, and `app.js` from a temporary `_site` artifact directory.
- Deploy on pushes to `main` and allow manual `workflow_dispatch` runs.

## Review Focus

- Whitespace-only titles must not create tasks or enter storage. Test `test_blank_title_is_rejected` in Task 1.
- HTML-like text must display literally and execute no markup. Test `test_task_text_is_rendered_as_text` in Task 1.
- Malformed saved JSON must show a storage notice while leaving task entry usable. Test `test_corrupt_storage_keeps_page_usable` in Task 1.
- Denied browser storage must show a notice while leaving in-session task actions usable. Test `test_storage_denial_keeps_page_usable` in Task 1.
- Keyboard focus and a 375-pixel viewport must remain usable without horizontal overflow. Test `test_keyboard_and_mobile_layout` in Task 2.

---

### Task 1: Build accessible task interactions and browser persistence

**Files:**
- Create: `index.html`
- Create: `app.js`
- Create temporarily outside the repository: `/tmp/todo_smoke.py`

**Interfaces:**
- `index.html` provides `form#task-form`, `input#task-input` with label `New task`, a submit button named `Add task`, `ul#task-list`, buttons named `All`, `Active`, and `Completed` with `data-filter="all|active|completed"`, `output#remaining-count`, a `Clear completed` button, and initially hidden `p#storage-notice` with `role="status"`.
- Each task is `{ id: string, title: string, completed: boolean, createdAt: number }`. The app stores the array under `todo-test.tasks.v1`.
- Each task row exposes a checkbox named `Complete task: <title>`, an edit button named `Edit task: <title>`, and a delete button named `Delete task: <title>`. Edit mode provides a labeled input plus `Save` and `Cancel` buttons; Enter saves and Escape cancels. `#remaining-count` reads `1 task remaining` or `N tasks remaining`.
- `app.js` owns task loading, rendering, form handling, task actions, filtering, and guarded storage access. Render task titles with `textContent`.

- [ ] **Step 1: Write the temporary Playwright browser checks**

Create `/tmp/todo_smoke.py` with `--base-url` and optional `--test` arguments and these checks using `playwright.sync_api` and Chromium:
- `test_blank_title_is_rejected`: submit spaces; assert there are zero list items and no nonempty task array is stored.
- `test_task_text_is_rendered_as_text`: add `Buy tea <b>today</b>`; assert the exact text appears in one list item, no `b` element was created, and no dialog opened.
- `test_edit_complete_filter_delete_and_clear`: edit a task and save it; assert the remaining count is correct; complete it; assert it appears in Completed and not Active; delete it; add and complete a second task; clear completed; assert there are no list items and no stored tasks.
- `test_persistence_after_reload`: add a task, reload, and assert the row and saved task remain.
- `test_corrupt_storage_keeps_page_usable`: initialize the versioned storage key to invalid JSON; assert the notice is visible, then add a task and assert it appears.
- `test_storage_denial_keeps_page_usable`: make the page's `localStorage` getter throw before navigation; assert the notice is visible and add/complete a task successfully in the current page.

- [ ] **Step 2: Run the browser checks against the empty baseline**

Run: `python3 /tmp/todo_smoke.py --base-url http://127.0.0.1:8000`
Expected: FAIL because the empty repository has no todo page or controls.

- [ ] **Step 3: Implement the semantic page and interactions**

Add the IDs, labels, and accessible names defined above. Keep the UI copy concise and friendly. Trim titles and reject blank values. Store and restore the task array; catch malformed JSON and storage exceptions, show `#storage-notice`, and preserve in-memory interactions. Use DOM creation and `textContent` for all user-provided titles. Keep the All, Active, and Completed filters independent of stored data. Render helpful empty states for a new list and for a filter with no matching tasks.

- [ ] **Step 4: Run the task interaction checks**

Run a local server with `python3 -m http.server 8000 --directory /workspace/todo_test`, then run `python3 /tmp/todo_smoke.py --base-url http://127.0.0.1:8000`.
Expected: all six named checks pass in Chromium.

- [ ] **Step 5: Commit the working interactions**

Commit `index.html` and `app.js` as `feat: add personal todo list interactions`.

### Task 2: Add the responsive visual design

**Files:**
- Create: `styles.css`
- Modify: `/tmp/todo_smoke.py`
- Modify: `index.html` to load `styles.css` with a relative path

**Interfaces:**
- CSS styles the existing HTML contract without changing task state or storage behavior.
- Focusable controls expose a visible focus indicator; the page remains readable at 375 px and desktop widths.

- [ ] **Step 1: Add `test_keyboard_and_mobile_layout` to the temporary browser checks**

At viewport widths 375 px and 1280 px, assert `document.documentElement.scrollWidth <= window.innerWidth`. Tab from the document start and assert `#task-input` receives focus with a visible outline.

- [ ] **Step 2: Run the new layout check before adding CSS**

Run: `python3 /tmp/todo_smoke.py --base-url http://127.0.0.1:8000 --test keyboard_and_mobile_layout`
Expected: FAIL because the stylesheet and visible focus treatment are not present.

- [ ] **Step 3: Implement the approved visual design**

Use a warm paper background, dark text, coral accents, a centered responsive column, clear task rows, and visible hover/focus states. Add a mobile layout that wraps controls without horizontal overflow. Reference `styles.css` relatively from `index.html`.

- [ ] **Step 4: Run the complete browser check list**

Run: `python3 /tmp/todo_smoke.py --base-url http://127.0.0.1:8000`
Expected: all seven browser checks pass at desktop and mobile widths.

- [ ] **Step 5: Commit the responsive page**

Commit `styles.css` and the stylesheet link in `index.html` as `style: add responsive todo list layout`. Keep the temporary browser checks in `/tmp`.

### Task 3: Deploy the static site through GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create temporarily outside the repository: `/tmp/check_pages_workflow.py`

**Interfaces:**
- The workflow triggers on pushes to `main` and `workflow_dispatch`.
- The deploy job has `contents: read`, `pages: write`, and `id-token: write`, uses the `github-pages` environment, and stages only the three app files into `_site`.
- Use `actions/checkout@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3` with path `_site`, and `actions/deploy-pages@v4`.

- [ ] **Step 1: Write the temporary workflow assertions**

Create `/tmp/check_pages_workflow.py` to parse `.github/workflows/deploy.yml` with PyYAML's `BaseLoader` and assert both triggers, the three permission values, the official Pages action versions, and that the workflow stages only the three app files into `_site`.

- [ ] **Step 2: Run the workflow assertions before adding the workflow**

Run: `python3 /tmp/check_pages_workflow.py`
Expected: FAIL because `.github/workflows/deploy.yml` does not exist yet.

- [ ] **Step 3: Add the Pages workflow**

Create `.github/workflows/deploy.yml`. The job copies only `index.html`, `styles.css`, and `app.js` into `_site`, configures Pages, uploads `_site`, and deploys the artifact. Add a `github-pages` environment URL from the deploy action output and a `pages` concurrency group.

- [ ] **Step 4: Validate, commit, and push the release**

Run `python3 /tmp/check_pages_workflow.py`, stage a local `_site` copy and serve it to rerun the browser checks, then commit the workflow as `ci: deploy todo list to GitHub Pages`. Push the current commit to the empty remote's `main` branch with `git push -u origin HEAD:main`.

- [ ] **Step 5: Confirm the published page**

Request `https://joejcwu.github.io/todo_test/`, `styles.css`, and `app.js` until GitHub Pages finishes propagating. Where public read access permits, inspect the Actions run status; also run the complete Playwright check list against the published URL. Expected: page and assets return successfully and browser interactions work. If repository settings block deployment, report the exact Pages or Actions setting required.
