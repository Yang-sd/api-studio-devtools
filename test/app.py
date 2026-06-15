import json
import sqlite3
import os
from datetime import datetime
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), "data.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT (datetime('now', 'localtime')),
            updated_at TEXT DEFAULT (datetime('now', 'localtime'))
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS analytics_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT NOT NULL,
            event_type TEXT DEFAULT 'button_click',
            button_id TEXT DEFAULT '',
            session_id TEXT DEFAULT '',
            trace_id TEXT DEFAULT '',
            page_url TEXT DEFAULT '',
            payload TEXT DEFAULT '{}',
            user_agent TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now', 'localtime'))
        )
    """)
    # seed some demo data
    count = conn.execute("SELECT COUNT(*) FROM tasks").fetchone()[0]
    if count == 0:
        samples = [
            ("完成用户认证模块", "实现 JWT 登录和注册功能", "pending"),
            ("优化数据库查询", "给高频查询添加索引, 提升响应速度", "in_progress"),
            ("编写 API 文档", "使用 Swagger 生成 OpenAPI 文档", "done"),
            ("部署到测试环境", "配置 Docker compose 并测试", "pending"),
            ("修复搜索分页 Bug", "翻页后筛选条件丢失的问题", "pending"),
        ]
        conn.executemany(
            "INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)",
            samples,
        )
        conn.commit()
    conn.close()


# ---- API ----

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/tasks", methods=["GET"])
def list_tasks():
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM tasks ORDER BY updated_at DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/tasks/<int:task_id>", methods=["GET"])
def get_task(task_id):
    conn = get_db()
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    conn.close()
    if row is None:
        return jsonify({"error": "not found"}), 404
    return jsonify(dict(row))


@app.route("/api/tasks", methods=["POST"])
def create_task():
    data = request.get_json(force=True)
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400
    description = data.get("description", "").strip()
    status = data.get("status", "pending").strip()
    if status not in ("pending", "in_progress", "done"):
        status = "pending"
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)",
        (title, description, status),
    )
    conn.commit()
    row = conn.execute(
        "SELECT * FROM tasks WHERE id = ?", (cur.lastrowid,)
    ).fetchone()
    conn.close()
    return jsonify(dict(row)), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json(force=True)
    conn = get_db()
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if row is None:
        conn.close()
        return jsonify({"error": "not found"}), 404
    title = data.get("title", row["title"]).strip()
    description = data.get("description", row["description"]).strip()
    status = data.get("status", row["status"]).strip()
    if status not in ("pending", "in_progress", "done"):
        status = row["status"]
    conn.execute(
        "UPDATE tasks SET title=?, description=?, status=?, updated_at=datetime('now','localtime') WHERE id=?",
        (title, description, status, task_id),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    conn.close()
    return jsonify(dict(row))


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    conn = get_db()
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if row is None:
        conn.close()
        return jsonify({"error": "not found"}), 404
    conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "deleted"})


@app.route("/api/tasks/search", methods=["GET"])
def search_tasks():
    q = request.args.get("q", "").strip()
    conn = get_db()
    if q:
        rows = conn.execute(
            "SELECT * FROM tasks WHERE title LIKE ? OR description LIKE ? ORDER BY updated_at DESC",
            (f"%{q}%", f"%{q}%"),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM tasks ORDER BY updated_at DESC"
        ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/network/probe", methods=["GET", "POST"])
def network_probe():
    size = request.args.get("size", "256").strip()
    try:
        size = int(size)
    except ValueError:
        size = 256
    size = min(max(size, 0), 1024 * 512)

    request_body = request.get_data() or b""
    return jsonify({
        "ok": True,
        "message": "network probe ok",
        "method": request.method,
        "server_time": datetime.now().isoformat(timespec="milliseconds"),
        "request_bytes": len(request_body),
        "response_bytes": size,
        "payload": "x" * size,
    })


@app.route("/api/upload-demo", methods=["POST"])
def upload_demo():
    fields = {}
    for key in request.form.keys():
        values = request.form.getlist(key)
        fields[key] = values if len(values) > 1 else values[0]

    files = []
    for field_name in request.files.keys():
        for uploaded in request.files.getlist(field_name):
            content = uploaded.read()
            files.append({
                "field": field_name,
                "filename": uploaded.filename,
                "content_type": uploaded.content_type,
                "bytes": len(content),
            })

    return jsonify({
        "ok": True,
        "message": "upload demo ok",
        "content_type": request.content_type,
        "fields": fields,
        "files": files,
        "file_count": len(files),
        "server_time": datetime.now().isoformat(timespec="milliseconds"),
    })


@app.route("/api/analytics/events", methods=["GET"])
def list_analytics_events():
    limit = request.args.get("limit", "20").strip()
    try:
        limit = min(max(int(limit), 1), 100)
    except ValueError:
        limit = 20

    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM analytics_events ORDER BY id DESC LIMIT ?",
        (limit,),
    ).fetchall()
    conn.close()

    events = []
    for row in rows:
        item = dict(row)
        item["payload"] = json.loads(item["payload"] or "{}")
        events.append(item)
    return jsonify(events)


@app.route("/api/analytics/events", methods=["POST"])
def create_analytics_event():
    data = request.get_json(force=True)
    event_name = data.get("event_name", "").strip()
    if not event_name:
        return jsonify({"error": "event_name is required"}), 400

    event_type = data.get("event_type", "button_click").strip() or "button_click"
    button_id = data.get("button_id", "").strip()
    session_id = data.get("session_id", "").strip()
    trace_id = data.get("trace_id", "").strip()
    page_url = data.get("page_url", "").strip()
    user_agent = request.headers.get("User-Agent", "")
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))

    conn = get_db()
    cur = conn.execute(
        """
        INSERT INTO analytics_events
            (event_name, event_type, button_id, session_id, trace_id, page_url, payload, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (event_name, event_type, button_id, session_id, trace_id, page_url, payload, user_agent),
    )
    conn.commit()
    row = conn.execute(
        "SELECT * FROM analytics_events WHERE id = ?",
        (cur.lastrowid,),
    ).fetchone()
    conn.close()

    result = dict(row)
    result["payload"] = json.loads(result["payload"] or "{}")
    return jsonify(result), 201


# Initialize the database at module load time (required for gunicorn)
init_db()

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=8080, debug=True)
