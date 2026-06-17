#!/usr/bin/env python3
"""Diarum MCP Server - 用于 LobeHub 的日记增删改查 MCP Server。"""

from __future__ import annotations

import json
import os
import sys
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from mcp.server.fastmcp import FastMCP


def _load_env_config() -> tuple[str, str]:
    """从环境变量或 config.json 读取 hostname 和 token。"""
    hostname = os.environ.get("DIARUM_HOSTNAME", "").strip()
    token = os.environ.get("DIARUM_TOKEN", "").strip()

    config_path = os.environ.get("DIARUM_CONFIG", "config.json")
    if (not hostname or not token) and os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                cfg = json.load(f)
            hostname = hostname or str(cfg.get("hostname", "")).strip()
            token = token or str(cfg.get("token", "")).strip()
        except (OSError, json.JSONDecodeError):
            pass

    if not hostname or not token:
        raise SystemExit(
            "错误: 请设置 DIARUM_HOSTNAME 和 DIARUM_TOKEN 环境变量，"
            "或在 config.json 中提供 hostname/token。"
        )

    if "://" not in hostname:
        hostname = "https://" + hostname
    return hostname.rstrip("/"), token


HOSTNAME, TOKEN = _load_env_config()
BASE_URL = f"{HOSTNAME}/api/v1/diaries"

app = FastMCP("diarum")


def _request(
    method: str,
    url: str,
    params: dict[str, Any] | None = None,
    body: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """发送 HTTP 请求到日记 API。"""
    query: dict[str, Any] = {"token": TOKEN}
    if params:
        query.update({k: v for k, v in params.items() if v is not None})
    full_url = f"{url}?{urlencode(query, doseq=True)}"

    data = None
    headers = {"Accept": "application/json"}
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json; charset=utf-8"

    req = Request(full_url, data=data, method=method.upper(), headers=headers)
    try:
        with urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
    except HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"error": raw}
        return {"status": e.code, "ok": False, **payload}
    except URLError as e:
        return {"status": 0, "ok": False, "error": f"网络错误: {e.reason}"}
    except Exception as e:  # noqa: BLE001
        return {"status": 0, "ok": False, "error": f"请求失败: {e}"}

    try:
        payload = json.loads(raw) if raw else {}
    except json.JSONDecodeError:
        payload = {"raw": raw}
    return {"status": 200, "ok": True, **(payload if isinstance(payload, dict) else {"data": payload})}


def _format_entry(item: dict[str, Any]) -> str:
    """将单条日记格式化为可读字符串。"""
    lines = []
    fields = [("id", "ID"), ("date", "日期"), ("mood", "心情"), ("weather", "天气"), ("content", "内容")]
    for key, label in fields:
        if key in item:
            value = item[key]
            if value is None or value == "":
                continue
            lines.append(f"{label}: {value}")
    extra = [f"{k}: {v}" for k, v in item.items() if k not in {f for f, _ in fields}]
    lines.extend(extra)
    return "\n".join(lines)


@app.tool()
def get_diary(date: str) -> str:
    """按日期获取日记。date 格式: YYYY-MM-DD。"""
    resp = _request("GET", BASE_URL, params={"date": date})
    if not resp.get("ok"):
        return f"获取失败: {resp}"
    data = resp.get("data") or resp.get("diaries") or resp
    if isinstance(data, list):
        if not data:
            return f"{date} 没有日记。"
        return "\n\n---\n\n".join(_format_entry(d) for d in data)
    if isinstance(data, dict) and not data:
        return f"{date} 没有日记。"
    return _format_entry(data)


@app.tool()
def get_diary_range(start: str, end: str) -> str:
    """按日期范围获取日记。start 与 end 格式: YYYY-MM-DD。"""
    resp = _request("GET", BASE_URL, params={"start": start, "end": end})
    if not resp.get("ok"):
        return f"获取失败: {resp}"
    data = resp.get("data") or resp.get("diaries") or []
    if not data:
        return f"{start} 至 {end} 没有日记。"
    return "\n\n---\n\n".join(_format_entry(d) for d in data)


@app.tool()
def create_or_update_diary(date: str, content: str, mood: str = "", weather: str = "") -> str:
    """创建或更新日记。若该日期已有日记,通常会被更新。"""
    body: dict[str, Any] = {"date": date, "content": content}
    if mood:
        body["mood"] = mood
    if weather:
        body["weather"] = weather
    resp = _request("POST", BASE_URL, body=body)
    return json.dumps(resp, ensure_ascii=False, indent=2)


@app.tool()
def update_diary_by_id(diary_id: str, content: str = "", mood: str = "", weather: str = "") -> str:
    """按 ID 更新日记。至少需要提供 content/mood/weather 其中之一。"""
    body: dict[str, Any] = {}
    if content:
        body["content"] = content
    if mood:
        body["mood"] = mood
    if weather:
        body["weather"] = weather
    if not body:
        return "错误: 至少提供 content、mood 或 weather 中的一个参数。"
    safe_id = quote(str(diary_id), safe="")
    resp = _request("PUT", f"{BASE_URL}/{safe_id}", body=body)
    return json.dumps(resp, ensure_ascii=False, indent=2)


@app.tool()
def delete_diary_by_id(diary_id: str) -> str:
    """按 ID 删除日记。"""
    safe_id = quote(str(diary_id), safe="")
    resp = _request("DELETE", f"{BASE_URL}/{safe_id}")
    return json.dumps(resp, ensure_ascii=False, indent=2)


@app.tool()
def delete_diary_by_date(date: str) -> str:
    """按日期删除日记。date 格式: YYYY-MM-DD。"""
    resp = _request("DELETE", BASE_URL, params={"date": date})
    return json.dumps(resp, ensure_ascii=False, indent=2)


def main() -> None:
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        sample = _request("GET", BASE_URL, params={"date": "2026-06-16"})
        print(json.dumps(sample, ensure_ascii=False, indent=2))
        return
    app.run()


if __name__ == "__main__":
    main()
