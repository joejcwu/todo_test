# Personal Todo List Design

Date: 2026-10-14

## Goal

Create a small, polished personal todo list that can be hosted as a static GitHub Pages site. A visitor can manage everyday tasks without an account or external service. Tasks persist in the browser that created them.

## Approach

Use plain HTML, CSS, and JavaScript. A static page has no build tool or runtime service to maintain, and GitHub Pages can serve it directly. A React/Vite app would add build tooling without a need in this scope. A backend would enable accounts and cross-device sync, but would add hosting and credential requirements that the requested personal list does not need.

The repository will contain `index.html`, `styles.css`, and `app.js`, plus a GitHub Actions workflow for Pages deployment. There will be no runtime or package dependencies.

## User experience

The page uses a warm paper background, dark text, and coral accents. A centered, responsive column contains a short introduction, the task entry form, status filters, the task list, a remaining-task count, and a clear-completed control. The interface uses English text.

Visitors can add, edit, complete, and delete tasks. They can filter the list by All, Active, and Completed. Empty and filtered-empty states explain what to do next. Inputs and controls have accessible labels, visible keyboard focus, and semantic HTML. User-entered task text is rendered as text rather than interpreted as markup.

## Data and persistence

Each task has an ID, title, completion state, and creation timestamp. The app stores the task list under a versioned key in `localStorage` and restores it when the page loads. Titles are trimmed and blank titles are rejected. No account or cross-device synchronization is included.

If browser storage is unavailable or contains unreadable data, the page stays usable for the current session and displays a clear notice that changes may not persist after reload. Storage errors must not prevent task interactions in memory.

## Hosting and deployment

The production URL is `https://joejcwu.github.io/todo_test/`. App assets use relative paths so they resolve from the project subpath. A GitHub Actions workflow runs on pushes to `main` and supports manual dispatch. It stages only the three app files in a temporary `_site` directory, then deploys that directory with the official GitHub Pages actions. The workflow requests only the Pages and OpenID Connect permissions required for deployment.

The workflow does not commit generated artifacts or modify application files. If repository or organization settings prevent Actions-based Pages deployment, the blocker and the exact required setting will be reported.

## Readiness checks

Before publication, exercise task creation, validation of blank input, editing, completion, deletion, each filter, clearing completed tasks, persistence after reload, storage-error handling, keyboard operation, and a narrow viewport. After publication, request the page and its app assets at the production URL and confirm that the deployed workflow completed. No automated test framework is needed for this dependency-free page.

## Out of scope

- User accounts, collaboration, and cross-device synchronization
- Due dates, reminders, priorities, tags, and recurring tasks
- Third-party analytics or runtime services
