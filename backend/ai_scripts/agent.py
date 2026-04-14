#!/usr/bin/env python3
"""
Discord Agent - 股票分析 AI Agent
透過 Discord 訊息控制股票分析程式，並每日自動回傳分析結果
"""

import os
import re
import asyncio
import subprocess
from datetime import datetime
import discord
from discord.ext import tasks
from google import genai

# ─────────────────────────────────────────
# 設定區
# ─────────────────────────────────────────
DISCORD_TOKEN  = os.environ.get("DISCORD_TOKEN", "your_discord_token")
CHANNEL_ID     = 793841869988691972
PROJECT_ROOT   = "/Users/cengchenxu/stock project"
SCRIPTS_DIR    = os.path.join(PROJECT_ROOT, "backend", "ai_scripts")
ANALYST_SCRIPT = os.path.join(SCRIPTS_DIR, "ai_analyst.py")
HISTORY_SCRIPT = os.path.join(SCRIPTS_DIR, "stock_history.py")
GEMINI_KEY     = os.environ.get("GEMINI_API_KEY", "your_gemini_key")
DAILY_HOUR     = 8
DAILY_MINUTE   = 0

gemini = genai.Client(api_key=GEMINI_KEY)

# ─────────────────────────────────────────
# Discord Bot 設定
# ─────────────────────────────────────────
intents = discord.Intents.default()
intents.message_content = True
bot = discord.Client(intents=intents)

# ─────────────────────────────────────────
# 工具函式
# ─────────────────────────────────────────
def run_script_with_arg(script_path: str, arg: str) -> str:
    try:
        venv_python = os.path.join(PROJECT_ROOT, ".venv", "bin", "python3")
        result = subprocess.run(
            [venv_python, script_path, arg],
            capture_output=True, text=True, timeout=180,
            cwd=PROJECT_ROOT
        )
        output = result.stdout.strip() or result.stderr.strip()
        return output if output else "執行完成，無輸出"
    except subprocess.TimeoutExpired:
        return "❌ 執行超時（超過 180 秒）"
    except Exception as e:
        return f"❌ 執行失敗：{e}"


def check_server_status() -> str:
    try:
        result = subprocess.run(["pgrep", "-f", "server.js"], capture_output=True, text=True)
        if result.stdout.strip():
            return "✅ server.js 正在運行"
        else:
            return "❌ server.js 沒有在跑，請手動啟動"
    except Exception as e:
        return f"無法檢查狀態：{e}"


def read_script(filename: str) -> str:
    name_map = {"ai_analyst": ANALYST_SCRIPT, "stock_history": HISTORY_SCRIPT}
    path = name_map.get(filename.strip().lower())
    if not path:
        return f"❌ 找不到檔案：{filename}，可用：ai_analyst, stock_history"
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        text = f"📄 {os.path.basename(path)}:\n```python\n{content}\n```"
        return text[:1900] + "\n...（內容過長已截斷）" if len(text) > 1900 else text
    except Exception as e:
        return f"❌ 讀取失敗：{e}"


def ai_modify_code(instruction: str) -> str:
    try:
        with open(ANALYST_SCRIPT, "r", encoding="utf-8") as f:
            analyst_code = f.read()
        with open(HISTORY_SCRIPT, "r", encoding="utf-8") as f:
            history_code = f.read()

        prompt = f"""你是一個 Python 程式修改助手。以下是目前的程式碼：

=== ai_analyst.py ===
{analyst_code}

=== stock_history.py ===
{history_code}

使用者的修改需求：
{instruction}

請：
1. 判斷要修改哪個檔案（或兩個都要）
2. 回傳修改後的完整程式碼
3. 用以下格式回應：

MODIFY_FILE: ai_analyst.py
```python
（修改後完整程式碼）
```

MODIFY_FILE: stock_history.py
```python
（修改後完整程式碼，如果不需修改就跳過）
```

SUMMARY:
（用繁體中文說明你改了什麼）
"""
        response = gemini.models.generate_content(model="gemini-2.5-flash-preview-04-17", contents=prompt)
        reply = response.text

        files_modified = []
        file_pattern = r'MODIFY_FILE:\s*(\S+)\s*```python\s*(.*?)```'
        matches = re.findall(file_pattern, reply, re.DOTALL)

        for filename, new_code in matches:
            if filename == "ai_analyst.py":
                target = ANALYST_SCRIPT
            elif filename == "stock_history.py":
                target = HISTORY_SCRIPT
            else:
                continue
            with open(target, "r", encoding="utf-8") as f:
                original = f.read()
            with open(target + ".bak", "w", encoding="utf-8") as f:
                f.write(original)
            with open(target, "w", encoding="utf-8") as f:
                f.write(new_code.strip())
            files_modified.append(filename)

        summary_match = re.search(r'SUMMARY:\s*(.*?)$', reply, re.DOTALL)
        summary = summary_match.group(1).strip() if summary_match else "修改完成"

        if files_modified:
            return f"✅ 已修改：{', '.join(files_modified)}\n（原檔備份為 .bak）\n\n📝 {summary}"
        else:
            return f"🤔 Gemini 建議：\n{reply[:500]}"
    except Exception as e:
        return f"❌ AI 修改失敗：{e}"


def handle_command(text: str) -> str:
    text = text.strip()

    if text in ["狀態", "status"]:
        return check_server_status()
    elif text in ["跑分析", "分析", "run"]:
        return run_script_with_arg(ANALYST_SCRIPT, "2330.TW")
    elif text.startswith("分析 ") or text.startswith("analyze "):
        symbol = text.split(" ", 1)[1].strip().upper()
        return run_script_with_arg(ANALYST_SCRIPT, symbol)
    elif text in ["更新資料", "抓資料", "fetch"]:
        return run_script_with_arg(HISTORY_SCRIPT, "2330.TW")
    elif text.startswith("更新 ") or text.startswith("抓資料 "):
        symbol = text.split(" ", 1)[1].strip().upper()
        return run_script_with_arg(HISTORY_SCRIPT, symbol)
    elif text.startswith("顯示程式碼"):
        parts = text.split(" ", 1)
        filename = parts[1] if len(parts) > 1 else "ai_analyst"
        return read_script(filename)
    elif text.startswith("幫我改：") or text.startswith("修改："):
        instruction = text.split("：", 1)[1]
        return ai_modify_code(instruction)
    elif text in ["幫助", "help", "?"]:
        return (
            "📋 **可用指令：**\n"
            "• `狀態` - 檢查 server 是否運行\n"
            "• `分析 TSLA` - 分析指定股票\n"
            "• `分析 2330.TW` - 分析台股\n"
            "• `更新 TSLA` - 抓取最新資料\n"
            "• `顯示程式碼 ai_analyst` - 查看程式碼\n"
            "• `顯示程式碼 stock_history` - 查看程式碼\n"
            "• `幫我改：xxx` - AI 修改程式碼\n"
            "• `幫助` - 顯示此選單"
        )
    else:
        try:
            response = gemini.models.generate_content(
                model="gemini-2.5-flash-preview-04-17",
                contents=f"你是股票分析助手，用繁體中文簡短回答：{text}"
            )
            return response.text
        except Exception as e:
            return "❓ 不認識的指令，輸入「幫助」查看可用指令"


# ─────────────────────────────────────────
# Discord 事件
# ─────────────────────────────────────────
@bot.event
async def on_ready():
    print(f"🤖 Discord Agent 啟動：{bot.user}")
    channel = bot.get_channel(CHANNEL_ID)
    if channel:
        await channel.send("🤖 **Agent 已啟動！**\n輸入 `幫助` 查看可用指令")
    daily_report.start()


async def process_and_reply(channel, text):
    """在背景執行指令並回傳結果"""
    loop = asyncio.get_event_loop()
    reply = await loop.run_in_executor(None, handle_command, text)
    if len(reply) > 1900:
        chunks = [reply[i:i+1900] for i in range(0, len(reply), 1900)]
        for chunk in chunks:
            await channel.send(chunk)
    else:
        await channel.send(reply)


@bot.event
async def on_message(message):
    if message.author == bot.user:
        return
    if message.channel.id != CHANNEL_ID:
        return

    text = message.content.strip()
    print(f"收到指令：{text}")

    if any(text.startswith(k) for k in ["分析", "更新", "跑分析", "幫我改", "修改"]):
        await message.channel.send(f"⏳ 正在處理：`{text}`，請稍候...")

    asyncio.create_task(process_and_reply(message.channel, text))


# ─────────────────────────────────────────
# 每日定時任務
# ─────────────────────────────────────────
@tasks.loop(minutes=1)
async def daily_report():
    now = datetime.now()
    if now.hour == DAILY_HOUR and now.minute == DAILY_MINUTE:
        channel = bot.get_channel(CHANNEL_ID)
        if channel:
            await channel.send(f"📊 每日股票分析開始（{now.strftime('%Y-%m-%d %H:%M')}）")
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, run_script_with_arg, ANALYST_SCRIPT, "2330.TW")
            await channel.send(result)


# ─────────────────────────────────────────
# 啟動
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("🤖 Discord Agent 啟動中...")
    bot.run(DISCORD_TOKEN)