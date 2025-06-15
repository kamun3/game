from flask import Flask, request, jsonify, render_template_string
import requests
import base64
import json

# إعدادات GitHub
GITHUB_TOKEN = "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"
REPO_OWNER = "kamun3"
REPO_NAME = "game"
FILE_PATH = "servers.json"

# إعداد Webhook
DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1381319218821337271/yCzV8vwqBSOaREM7iBeFkumzOPNYU09DE3MmYEXHDBe4DdiaBcUr7WbNGc0iewuT3q0u"

app = Flask(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>سيرفرات المشاهير</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #111; color: #eee; padding: 20px; }
        h1 { color: #ffcc00; }
        .server { margin: 10px 0; padding: 10px; background: #222; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>📋 قائمة السيرفرات</h1>
    {% for s in servers %}
        <div class="server">
            <strong>📛 اسم السيرفر:</strong> {{ s.name }}<br>
            <strong>🔒 كلمة المرور:</strong> {{ s.password if s.password else "بدون" }}
        </div>
    {% endfor %}
</body>
</html>
"""

def get_file_sha():
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{FILE_PATH}"
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}
    res = requests.get(url, headers=headers)
    if res.status_code == 200:
        return res.json()["sha"]
    return None

def load_servers():
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{FILE_PATH}"
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}
    res = requests.get(url, headers=headers)
    if res.status_code == 200:
        content = res.json()["content"]
        return json.loads(base64.b64decode(content).decode("utf-8"))
    return []

def update_file(new_data):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{FILE_PATH}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    # تحميل البيانات الحالية
    current_data = load_servers()
    current_data.append(new_data)

    updated_content = json.dumps(current_data, ensure_ascii=False, indent=2)
    b64_content = base64.b64encode(updated_content.encode("utf-8")).decode("utf-8")

    sha = get_file_sha()

    payload = {
        "message": "تحديث السيرفرات",
        "content": b64_content,
        "branch": "main"
    }

    if sha:
        payload["sha"] = sha

    res = requests.put(url, headers=headers, json=payload)
    return res.ok

def send_to_discord(server_data):
    msg = {
        "content": f"🚀 **تم إنشاء سيرفر جديد!**\n📛 الاسم: `{server_data['name']}`\n🔒 الباسورد: `{server_data['password'] or 'بدون'}"
    }
    requests.post(DISCORD_WEBHOOK, json=msg)

@app.route("/update", methods=["POST"])
def update():
    data = request.json
    if update_file(data):
        send_to_discord(data)
        return jsonify({"status": "success"}), 200
    else:
        return jsonify({"status": "error"}), 500

@app.route("/")
def index():
    servers = load_servers()
    return render_template_string(HTML_TEMPLATE, servers=servers)

if __name__ == "__main__":
    app.run(port=5000)
