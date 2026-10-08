# Taskboard

A project and task manager built with Angular. Tasks live in projects, move across a Kanban board
by drag and drop, and can be tagged with colored labels. The screens follow a set of HTML design
mockups, and the data comes from a separate REST backend.

## Features

- **Projects:** a Dashboard with a progress card for every project, a project page (progress by
  status, due soon), and create, edit and delete. Deleting asks you to type the project name,
  because the backend also deletes the project's tasks.
- **Board:** one Kanban board per project (`/board/:projectId`) with four columns. Drag a card to
  another column to change its status. The move shows at once and is rolled back, with a toast, if
  the request fails.
- **Tasks:** create, view, edit and delete tasks with title, description, status, priority
  (Low, Medium, High, Critical), due date (overdue dates are highlighted), project and labels.
- **Labels:** a Labels page to create, edit and delete labels, each with its own colors and a count
  of the tasks that use it.
- **Sidebar:** project list with the open project highlighted. The last opened project is
  remembered, so "Board" returns to it.

## Tech stack

|                |                                                                                   |
| -------------- | --------------------------------------------------------------------------------- |
| Framework      | Angular 21: standalone components, signals, built-in control flow (`@if`, `@for`) |
| Drag and drop  | Angular CDK (`@angular/cdk`)                                                      |
| Forms and HTTP | Reactive forms, `HttpClient`, RxJS                                                |
| Styling        | SCSS with CSS variables (`src/styles.scss`), self-hosted fonts (`public/fonts`)   |
| Tooling        | Angular CLI, Vitest (unit tests), Prettier                                        |

## Requirements

- **Node.js 20.19 or newer** (developed with 20.20) and npm
- The **backend API running on `http://localhost:8080`**. It is a separate project and is not in
  this repository.

## Getting started

```bash
npm install
npm start          # dev server at http://localhost:4200
```

Start the backend first. `npm start` runs `ng serve` with `proxy.conf.json`, which forwards every
`/api` request to `http://localhost:8080`. This avoids CORS problems in development. If your
backend runs on another port, change `target` in `proxy.conf.json`.

Do not start the app with a bare `ng serve`: without the proxy, the `/api` calls fail.

## Scripts

| Command                    | What it does                               |
| -------------------------- | ------------------------------------------ |
| `npm start`                | Dev server with the API proxy              |
| `npm run build`            | Production build into `dist/`              |
| `npm run watch`            | Development build that rebuilds on changes |
| `npm test`                 | Unit tests with Vitest                     |
| `npx prettier --write src` | Format the code (config in `.prettierrc`)  |

## Routes

| Path                | Page                                                         |
| ------------------- | ------------------------------------------------------------ |
| `/dashboard`        | Projects with progress, and tasks due this week              |
| `/board`            | Redirects to the board of the last opened (or first) project |
| `/board/:projectId` | Kanban board of one project                                  |
| `/projects/:id`     | Project overview                                             |
| `/tasks/new`        | New task (`?project=` and `?status=` preselect values)       |
| `/tasks/:id`        | Task details                                                 |
| `/tasks/:id/edit`   | Edit task                                                    |
| `/labels`           | Manage labels                                                |
| `/backlog`          | Placeholder, marked "In dev" in the sidebar                  |

## Backend API

All requests go to `/api`. The app uses these endpoints:

| Resource | Endpoints                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| Tasks    | `GET /tasks`, `GET /tasks/{id}`, `POST /tasks`, `PUT /tasks/{id}`, `DELETE /tasks/{id}`, `PATCH /tasks/{id}/status` |
| Labels   | `GET /labels`, `POST /labels`, `PUT /labels/{id}`, `DELETE /labels/{id}`                                            |
| Projects | `GET /projects`, `POST /projects`, `PUT /projects/{id}`, `DELETE /projects/{id}`                                    |

Things worth knowing:

- Every task belongs to exactly one project. `POST` and `PUT /tasks` require `projectId`.
- A task is returned with full `labels`, but is saved with `labelIds`. A `PUT` without `labelIds`
  clears the task's labels, so the edit form always sends them.
- Moving a card on the board uses `PATCH /tasks/{id}/status` with `{ "status": "..." }`.
- `GET /labels` and `GET /projects` accept `?withCount=false`, which skips the count query. Screens
  that only need names and colors (the task form, the sidebar) use it.
- Deleting a project also deletes all of its tasks.
- The backend cannot filter tasks by project, so the board and the Dashboard filter in the browser.
- Task statuses are `PENDING`, `IN_PROGRESS`, `TESTING` and `COMPLETED`. They are shown as
  To do, In progress, In review and Done.

## Project structure

```
src/app/
├── core/layout/shell/        App shell: sidebar, projects list, router outlet, toast host
├── features/
│   ├── board/                Board page (columns, cards, drag and drop)
│   ├── dashboard/            Dashboard page
│   ├── labels/               Labels page and the label dialog
│   ├── projects/             Project page, project dialog, projects service,
│   │                         progress helper, /board redirect guard
│   ├── tasks/                Task pages (new, detail, edit), shared task form,
│   │                         models, tasks and labels services
│   └── backlog/              Placeholder page
└── shared/
    ├── components/           Confirm dialog, label chip, toast host, "in development" notice
    └── services/             Toast service
public/fonts/                 Self-hosted fonts (Bricolage Grotesque, Hanken Grotesk)
proxy.conf.json               Dev proxy: /api -> http://localhost:8080
```

## Conventions

- Standalone components only, with `inject()` instead of constructor parameters.
- State lives in services as signals. A service keeps a private writable signal and exposes it
  read-only, and components use `computed()` for derived data.
- Code is grouped by feature: a feature's models, services and components stay together, and only
  code used by several features goes to `shared/`.
- Colors and fonts are CSS variables and global classes (`.btn`, `.page`, `.breadcrumb`) in
  `src/styles.scss`. Component styles stay in the component's own `.scss` file.
- Dialogs use the native `<dialog>` element, so focus handling and the Escape key come from the
  browser.
- Code is formatted with Prettier. Run it before committing.

## Status and limits

- **Backlog** is a placeholder.
- **Not in the backend yet:** assignees, comments, subtasks, attachments and project members, so
  the app does not show them even though the designs do.
- **Order inside a column** is not saved: the backend has no position field, so a moved card
  appears in the backend's order, not where it was dropped.
- **Search and Filter** on the board are not implemented.
- **No authentication.**
- **Tests:** only the default `app.spec.ts` exists. The app was checked by hand and with scripted
  browser runs that are not part of this repository.
