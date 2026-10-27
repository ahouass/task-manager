import { useEffect, useMemo, useState, type FormEvent } from "react";
import "./App.css";

const API = "/tasks";

interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

type Filter = "all" | "open" | "done";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setError(null);
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTasks((await res.json()) as Task[]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, description: description.trim() || null }),
    });
    setTitle("");
    setDescription("");
    void refresh();
  }

  async function handleToggle(task: Task) {
    await fetch(`${API}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        completed: !task.completed,
      }),
    });
    void refresh();
  }

  async function handleDelete(id: number) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    void refresh();
  }

  const visible = useMemo(
    () =>
      tasks.filter((t) =>
        filter === "all" ? true : filter === "open" ? !t.completed : t.completed
      ),
    [tasks, filter]
  );

  const openCount = tasks.filter((t) => !t.completed).length;
  const doneCount = tasks.filter((t) => t.completed).length;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="paper">
      <header className="masthead">
        <div>
          <span className="stamp">No. 001</span>
          <h1>Task&nbsp;Book</h1>
          <p className="tagline">a small, honest list of things to do.</p>
        </div>
        <div className="date">{today}</div>
      </header>

      <hr className="rule" />

      <form className="compose" onSubmit={handleCreate} autoComplete="off">
        <label htmlFor="title" className="field-label">new entry</label>
        <div className="compose__row">
          <input
            id="title"
            type="text"
            maxLength={100}
            placeholder="What needs doing?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            id="description"
            type="text"
            placeholder="note (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" className="btn btn--ink">Add →</button>
        </div>
      </form>

      <section className="stats">
        <div className="stat">
          <span className="stat__num">{tasks.length}</span>
          <span className="stat__label">entries</span>
        </div>
        <div className="stat">
          <span className="stat__num">{openCount}</span>
          <span className="stat__label">open</span>
        </div>
        <div className="stat">
          <span className="stat__num">{doneCount}</span>
          <span className="stat__label">done</span>
        </div>
        <div className="stat stat--stamp">
          <span className="stat__label">filter:</span>
          {(["all", "open", "done"] as Filter[]).map((f) => (
            <button
              key={f}
              className={`chip ${filter === f ? "is-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <hr className="rule rule--thin" />

      {error && <p className="error">⚠ {error}</p>}

      {loading ? (
        <p className="loading">loading entries…</p>
      ) : visible.length === 0 ? (
        <p className="empty">Nothing on the page yet. Start with the form above ↑</p>
      ) : (
        <ul className="entries">
          {visible.map((t) => (
            <li key={t.id} className={`entry ${t.completed ? "is-done" : ""}`}>
              <button
                className="entry__check"
                aria-label="toggle"
                onClick={() => handleToggle(t)}
              />
              <div className="entry__body">
                <p className="entry__title">{t.title}</p>
                {t.description && <p className="entry__desc">{t.description}</p>}
                <p className="entry__meta">
                  {t.completed ? "done" : "open"} · added{" "}
                  {new Date(t.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="entry__actions">
                <button className="icon-btn" onClick={() => handleToggle(t)}>
                  toggle
                </button>
                <button className="icon-btn" onClick={() => handleDelete(t.id)}>
                  delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="colophon">— end of page —</footer>
    </div>
  );
}