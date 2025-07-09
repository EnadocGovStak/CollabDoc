## Chunk 1: Project Setup & Dependencies (Detailed)

**Objective:** Scaffold a new web project, install Syncfusion’s Document Editor, and verify that all dependencies and assets load correctly.

---

### 1. Prerequisites & Environment

1. **Node.js & npm**

   * Install Node.js ≥ 16.x and npm ≥ 8.x.
   * Verify with:

     ```bash
     node --version
     npm --version
     ```

2. **Syncfusion License**

   * Sign up for a [free Community License](https://www.syncfusion.com/products/communitylicense) (if eligible).
   * Download your license key and add it to your project as described in Syncfusion’s docs.

3. **Framework Choice**

   * This guide assumes a React project; adjust file paths for Angular or plain TypeScript as needed.

---

### 2. Scaffold React App

```bash
npx create-react-app doc-editor --template typescript
cd doc-editor
```

* *Challenge:* React’s strict mode can reveal side-effect issues. If you see double rendering, check that your editor initialization is idempotent.

---

### 3. Install Packages

```bash
npm install @syncfusion/ej2-documenteditor @syncfusion/ej2-base @syncfusion/ej2-react-base
```

* **Why multiple packages?**

  * `ej2-documenteditor` contains core editor logic.
  * `ej2-base` provides shared utilities.
  * `ej2-react-base` wraps EJ2 components for React.

---

### 4. Import Styles & Scripts

In `src/index.tsx` or `public/index.html`:

```html
<link
  href="https://cdn.syncfusion.com/ej2/24.1.41/material.css"
  rel="stylesheet"
/>
```

If using CDN for scripts (optional for rapid prototyping):

```html
<script src="https://cdn.syncfusion.com/ej2/24.1.41/dist/ej2.min.js"></script>
```

* *Issue to watch:* Conflicts with other CSS frameworks (e.g., Tailwind). Use scoped class names or CSS Modules to isolate styles.

---

### 5. Register Syncfusion License

In your app entry (e.g., `src/index.tsx`):

```ts
import { registerLicense } from '@syncfusion/ej2-base';
registerLicense(process.env.REACT_APP_SYNCFUSION_KEY || '');
```

* Store `REACT_APP_SYNCFUSION_KEY` in a `.env.local` file.

---

### 6. Verify Installation

Create a minimal component (`src/EditorTest.tsx`):

```tsx
import React from 'react';
import { DocumentEditorComponent } from '@syncfusion/ej2-react-documenteditor';

export const EditorTest = () => (
  <div style={{ height: '500px' }}>
    <DocumentEditorComponent id="document-editor" />
  </div>
);
```

Import and render in `App.tsx`. Then run:

```bash
npm start
```

You should see a blank Document Editor iframe with Syncfusion’s toolbar disabled by default.

---

## Test Cases for Chunk 1

| Test ID | Description               | Steps                                              | Expected Result                                                   |
| ------- | ------------------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| TC1.1   | **Dependency Resolution** | Run `npm install`.                                 | No errors; `node_modules/@syncfusion/ej2-documenteditor` exists.  |
| TC1.2   | **App Compiles**          | Run `npm run build`.                               | Build completes without errors or warnings about missing modules. |
| TC1.3   | **Editor Renders**        | Start dev server and navigate to `localhost:3000`. | A blank Document Editor area appears (no console errors).         |

---

**Research & Notes:**

* **Peer Dependencies:**
  Syncfusion packages may require React ≥ 17.x; mismatch can cause hooks errors.
* **CORS & Assets:**
  If you self-host CSS/JS, configure your server to serve static assets under `/syncfusion/*`.
* **Version Upgrades:**
  Always align major versions of `ej2-documenteditor` and `ej2-base` to avoid API changes.

---

*Once you’ve validated Chunk 1, let me know and we’ll proceed to Chunk 2: “Initialize Document Editor.”*

## Chunk 2: Initialize Document Editor (Detailed)

**Objective:** Instantiate and mount the Syncfusion Document Editor in your React app, ensuring proper lifecycle management and module injection.

---

### 1. Create an Editor Component

Create a new file at `src/components/DocEditor.tsx`:

```tsx
import React, { useEffect, useRef } from 'react';
import {
  DocumentEditor,
  Editor,
  Selection
} from '@syncfusion/ej2-documenteditor';

// Inject the core editing modules
DocumentEditor.Inject(Editor, Selection);

export const DocEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let editorObj: DocumentEditor | null = null;

    if (containerRef.current) {
      // Instantiate the editor
      editorObj = new DocumentEditor({
        height: '600px',
        isReadOnly: false,
      });
      // Mount it to the container div
      editorObj.appendTo(containerRef.current);
    }

    // Cleanup on unmount to prevent memory leaks and double-init in StrictMode
    return () => {
      if (editorObj) {
        editorObj.destroy();
        editorObj = null;
      }
    };
  }, []);

  return <div ref={containerRef} id="document-editor-container" />;
};
```

**Key points:**

* **Module injection** (`Editor`, `Selection`) is required before instantiating.
* Use a React ref and `useEffect` so that the DOM node exists when you call `appendTo`.
* Always **destroy** the instance on unmount to avoid leaks or duplicate mounts in React Strict Mode.

---

### 2. Integrate into Your App

In `src/App.tsx`, import and render your new component:

```tsx
import React from 'react';
import { DocEditor } from './components/DocEditor';

function App() {
  return (
    <div className="App">
      <h1>My Document Editor</h1>
      <DocEditor />
    </div>
  );
}

export default App;
```

Run `npm start` and navigate to `http://localhost:3000`. You should see the editor loaded within the page.

---

### 3. Test Cases for Chunk 2

| Test ID | Description                     | Steps                                                           | Expected Result                                                    |
| ------- | ------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------ |
| TC2.1   | **Component Renders Container** | Render `<DocEditor />` in a test or browser.                    | A `<div id="document-editor-container">` exists with no errors.    |
| TC2.2   | **Editor Constructor Called**   | Spy on `DocumentEditor` constructor via Jest, render component. | Constructor invoked with `{ height: '600px', isReadOnly: false }`. |
| TC2.3   | **DOM Mount**                   | Inspect container’s children after mount.                       | Container has child elements corresponding to the editor UI.       |
| TC2.4   | **Cleanup on Unmount**          | Unmount the component in a React Testing Library test.          | No lingering DOM elements or editor instance in memory.            |

---

### 4. Research & Common Pitfalls

* **React Strict Mode:**
  Mount/unmount runs twice in development. Without proper cleanup (`destroy()`), you’ll see console warnings or duplicated editors.

* **Server-Side Rendering (SSR):**
  If you’re using frameworks like Next.js, ensure `DocumentEditor` only runs on the client. Wrap initialization in a `useEffect` so it skips SSR.

* **CSS Conflicts:**
  The editor injects its own styles; co-existing frameworks (e.g., Tailwind) may override toolbar or dialog layouts. If you notice misaligned UI, use more specific CSS selectors or load Syncfusion’s theme CSS last.

* **Container Sizing:**
  The `height` config sets the editor viewport but not the parent container. Ensure your parent `<div>` (or its wrapper) has enough space (e.g., flex layouts or explicit CSS height).

---

Once you’ve verified initialization is working and your tests pass, we’ll move on to **Chunk 3: Enable History & Track Changes**.

## Chunk 3: Enable History & Track Changes (Record Management)

**Objective:** Inject and configure the Syncfusion Document Editor’s history and track‐changes modules so that all edits are recorded, can be undone/redone, and revisions are tracked for review.

---

### 1. Module Injection

Before creating your editor instance, inject the **EditorHistory** and **TrackChanges** modules along with the core editing modules:

```ts
import {
  DocumentEditor,
  Editor,
  Selection,
  EditorHistory,
  TrackChanges
} from '@syncfusion/ej2-documenteditor';

// Inject required modules for history and track changes
DocumentEditor.Inject(Editor, Selection, EditorHistory, TrackChanges);
```

> **Why?**
>
> * **EditorHistory** enables undo/redo stacks.
> * **TrackChanges** hooks into every insert/delete to mark revisions.

---

### 2. Configure Editor Options

When you instantiate the editor, enable both features:

```tsx
let editor = new DocumentEditor({
  height: '600px',
  isReadOnly: false,
  enableEditorHistory: true,      // turn on undo/redo
  enableTrackChanges: true        // start tracking revisions
});
editor.appendTo('#document-editor');
```

* `enableEditorHistory` keeps a stack of operations you can traverse with `editor.editorHistory.undo()` and `.redo()`.
* `enableTrackChanges` wraps each insertion/deletion into revision objects.

---

### 3. Expose Track‐Changes UI

To allow users to accept or reject revisions, add buttons in your toolbar (React example using DocumentEditorContainer):

```tsx
import { DocumentEditorContainerComponent, Toolbar } from '@syncfusion/ej2-react-documenteditor';

// In your render:
<DocumentEditorContainerComponent
  id="container"
  serviceUrl={serviceUrl}
  height="590px"
  enableToolbar={true}
  toolbarSettings={{
    items: [
      'Undo', 'Redo', '|',
      'TrackChanges', 'AcceptAll', 'RejectAll'
    ]
  }}
/>
```

* **TrackChanges** toggles the redlining view on/off.
* **AcceptAll**/**RejectAll** let reviewers bulk‐approve or discard revisions.

---

### 4. Test Cases for Chunk 3

| Test ID | Description                   | Steps                                                                                    | Expected Result                                                                         |
| ------- | ----------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| TC3.1   | **Undo/Redo Records Actions** | 1. Type “Hello”<br>2. Delete “o”<br>3. Call `editor.editorHistory.undo()` twice.         | After first undo, “o” reappears; after second undo, all text removed.                   |
| TC3.2   | **Track Insertions**          | 1. Type “World”<br>2. Inspect `editor.documentEditor.revisions` collection.              | New insertion revision exists, with author, timestamp, and insertion text.              |
| TC3.3   | **Track Deletions**           | 1. Delete a word<br>2. Check that deleted text is still in document with strike-through. | Deletion mark is visible in redlining view; revision object lists deleted text.         |
| TC3.4   | **Accept All Revisions**      | 1. Make multiple edits<br>2. Click **AcceptAll** toolbar button.                         | All revision markers removed; document content reflects all edits permanently.          |
| TC3.5   | **Reject All Revisions**      | 1. Make multiple edits<br>2. Click **RejectAll** toolbar button.                         | All revisions discarded; document reverts to original content before any tracked edits. |

---

### 5. Research & Common Pitfalls

* **Performance Overhead:**
  Tracking every keystroke can bloat the revision stack and slow rendering on large docs (> 1 MB). Consider disabling `enableTrackChanges` for batch imports.

* **Merging Imported Docs:**
  If loading an SFDT (Syncfusion format) that already contains revisions, you must replay or import existing revision objects into the editor’s `revisions` collection to preserve history.

* **Author Metadata:**
  By default, all revisions share a generic author. Use:

  ```ts
  editor.revisionAuthor = 'ReviewerName';
  ```

  to tag changes with specific user names.

* **Collaborative Editing Interaction:**
  When combining with collaborative modules, transform or serialize revision operations carefully to avoid conflicts. It’s best to disable track‐changes during high‐frequency sync, then re‐enable for review phases.

* **UI Visibility:**
  In some custom themes, revision highlights can blend into background. Adjust CSS variables (e.g., `--revision-color`) or load a revision‐aware theme.

---

Once you’ve verified recording and reviewing works correctly, let me know, and we’ll tackle **Chunk 4: Setup Web API for Import & Persistence**.
## Chunk 4: Setup Web API for Import & Persistence

**Objective:** Create an ASP.NET Core Web API endpoint that loads a stored document (SFDT) and replays any pending edit operations from your database, returning a fully-hydrated SFDT payload to the client.

---

### 1. Prerequisites & NuGet Packages

1. **.NET SDK ≥ 6.0**
2. **ASP.NET Core Web API project**

   ```bash
   dotnet new webapi -n DocumentEditorService
   cd DocumentEditorService
   ```
3. **Required NuGet**

   ```powershell
   Install-Package Syncfusion.EJ2.DocumentEditor.Web
   Install-Package Microsoft.EntityFrameworkCore.SqlServer
   Install-Package Newtonsoft.Json
   ```

---

### 2. Configuration in `appsettings.json`

Add your SQL connection string for the temporary‐actions store:

```json
{
  "ConnectionStrings": {
    "DocumentEditorDatabase": "<Your-SQL-Server-Connection>"
  }
}
```



---

### 3. Define Data Models

* **`FileInfo`** (payload from client):

  ```csharp
  public class FileInfo {
    public string FileName { get; set; }
    public string DocumentOwner { get; set; }  // optional, if you scope docs per user
  }
  ```
* **`DocumentContent`** (response to client):

  ```csharp
  public class DocumentContent {
    public int Version { get; set; }
    public string Sfdt { get; set; }
  }
  ```
* **`TempAction`** (EF Core entity for edit records):

  ```csharp
  public class TempAction {
    public int Id { get; set; }
    public string RoomName { get; set; }
    public int Version { get; set; }
    public string OperationJson { get; set; }
  }
  ```
* **`ApplicationDbContext`** (EF Core context):

  ```csharp
  public class ApplicationDbContext : DbContext {
    public DbSet<TempAction> TempActions { get; set; }
    public ApplicationDbContext(DbContextOptions options) : base(options) { }
  }
  ```

---

### 4. Implement the Import Endpoint

Create `DocumentEditorController.cs`:

```csharp
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Syncfusion.EJ2.DocumentEditor;
using Syncfusion.EJ2.DocumentEditor.Server;  // from Syncfusion.EJ2.DocumentEditor.Web
// ... plus your own namespaces

[ApiController]
[Route("api/[controller]/[action]")]
public class DocumentEditorController : ControllerBase {
  private readonly ApplicationDbContext _db;
  private readonly IWebHostEnvironment _env;

  public DocumentEditorController(ApplicationDbContext db, IWebHostEnvironment env) {
    _db = db;
    _env = env;
  }

  [HttpPost]
  public IActionResult ImportFile([FromBody] FileInfo param) {
    // 1. Load the SFDT file from disk or blob
    var filePath = Path.Combine(_env.ContentRootPath, "Docs", param.FileName + ".sfdt");
    if (!System.IO.File.Exists(filePath)) return NotFound("Document not found");

    string sfdt = System.IO.File.ReadAllText(filePath);

    // 2. Create WordDocument and import SFDT
    WordDocument document = new WordDocument();
    document.Open(sfdt);

    // 3. Retrieve pending actions from DB, ordered by Version
    var actions = _db.TempActions
      .Where(a => a.RoomName == param.FileName)
      .OrderBy(a => a.Version)
      .Select(a => JsonConvert.DeserializeObject<ActionInfo>(a.OperationJson))
      .ToList();

    // 4. Apply actions if any exist
    if (actions.Any()) {
      document.UpdateActions(actions);
    }

    // 5. Serialize back to SFDT and wrap response
    var content = new DocumentContent {
      Version = 0,
      Sfdt = JsonConvert.SerializeObject(document)
    };
    return Ok(content);
  }
}
```

> **Based on Syncfusion sample**&#x20;

---

### 5. Test Cases for Chunk 4

| Test ID | Description                           | Steps                                                                                                                                         | Expected Result                                                    |
| ------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| TC4.1   | **Import with No Pending Actions**    | 1. Place `TestDoc.sfdt` (simple SFDT with “Hello”).<br>2. Ensure no `TempActions` in DB for `TestDoc`.<br>3. POST `{ "fileName":"TestDoc" }`. | 200 OK with `sfdt` matching original file content; `version == 0`. |
| TC4.2   | **Import with Pending Insert Action** | 1. Add a `TempAction` record for `TestDoc`, version 1, operation JSON inserting “ World”.<br>2. POST as above.                                | Returned `sfdt` contains “Hello World” reflecting applied action.  |
| TC4.3   | **Non-existent Document**             | POST `{ "fileName":"NoSuchDoc" }`.                                                                                                            | 404 NotFound with message “Document not found”.                    |
| TC4.4   | **Malformed Payload**                 | POST `{ }` or missing `fileName`.                                                                                                             | 400 BadRequest due to model-binding error.                         |

---

### 6. Research & Common Pitfalls

* **Path Traversal Risks:** Always sanitize `param.FileName` to prevent “..\” exploits when reading files from disk.
* **Large SFDT Files:** For very large documents (> 5 MB), reading and serializing in-memory can spike GC. Consider streaming or pagination.
* **DB Growth:** High-frequency edits mean many `TempAction` rows; plan a cleanup or archiving strategy after sessions complete.
* **Concurrency & Ordering:** Ensuring `Version` is strictly incremented and actions are applied in order is critical. Mismatched versions will corrupt the document state.
* **Error Handling:** Wrap file and DB operations in `try/catch` and return meaningful HTTP codes to the client.

---

Once you’ve validated this import flow and your tests pass, we’ll proceed to **Chunk 5: API to Save & Transform Actions**.
