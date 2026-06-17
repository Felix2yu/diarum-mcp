# Skill: Diarum 日记 MCP

> 版本：1.0  
> 类型：MCP Server  
> 运行方式：stdio（标准输入输出）  
> 编程语言：Python 3  

一个用于 LobeHub 的日记增删改查 MCP Skill，基于官方 `mcp` Python SDK（FastMCP）实现。可以按日期或日期范围读取日记，按日期或 ID 创建、更新、删除日记。

---

## 功能总览

| 能力 | 说明 |
|---|---|
| 读取日记 | 按日期 / 日期范围拉取日记内容、心情、天气等信息 |
| 创建日记 | 按 `YYYY-MM-DD` 日期写入日记 |
| 更新日记 | 按日期（POST）或按 ID（PUT）部分更新 |
| 删除日记 | 按日期或按 ID 删除 |

---

## 前置依赖

- Python 3.9 及以上
- 已部署的 Diarum 日记服务，可访问 `https://{hostname}/api/v1/diaries`
- 有效的 API `token`

---

## 安装与配置

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置 hostname 与 token

二选一：

- **环境变量（推荐）**

  ```bash
  export DIARUM_HOSTNAME="your-diarum-host.example.com"
  export DIARUM_TOKEN="YOUR_API_TOKEN_HERE"
  ```

- **config.json**（与 `diarum_mcp.py` 同目录）

  ```json
  {
    "hostname": "your-diarum-host.example.com",
    "token": "YOUR_API_TOKEN_HERE"
  }
  ```

  可通过 `DIARUM_CONFIG` 指定其他路径。

`hostname` 若未带协议，默认补 `https://`。

### 3. 本地验证

```bash
python3 diarum_mcp.py test
```

该命令会尝试拉取一条示例日记，并打印原始响应。

---

## 在 LobeHub 中启用

在 LobeHub 的 MCP 配置中新增一个 Server：

```json
{
  "mcpServers": {
    "diarum": {
      "command": "python3",
      "args": ["/absolute/path/to/diarum_mcp.py"]
    }
  }
}
```

- `command`：Python 解释器的绝对路径（若使用 venv，请指向 venv 内的解释器）
- `args`：`diarum_mcp.py` 的绝对路径

保存并重载 LobeHub 后，即可在对话中使用以下工具。

---

## 工具（Tools）说明

### get_diary — 按日期获取日记

```
get_diary(date: str) -> str
```

- **date**：`YYYY-MM-DD`，例如 `2026-06-16`
- 返回该日期下所有日记的格式化文本。

### get_diary_range — 按日期范围获取日记

```
get_diary_range(start: str, end: str) -> str
```

- **start / end**：`YYYY-MM-DD`，闭区间
- 返回区间内所有日记。

### create_or_update_diary — 创建或按日期更新日记

```
create_or_update_diary(date: str, content: str, mood: str = "", weather: str = "") -> str
```

- **date**：`YYYY-MM-DD`
- **content**：日记正文（必填）
- **mood**：心情，例如「开心 / 平静 / 郁闷」
- **weather**：天气，例如「晴 / 多云 / 小雨」

同一日期再次调用通常会更新已有日记（取决于后端实现）。

### update_diary_by_id — 按 ID 更新日记

```
update_diary_by_id(diary_id: str, content: str = "", mood: str = "", weather: str = "") -> str
```

- **diary_id**：日记 ID（可通过读取日记接口获得）
- content / mood / weather 至少提供一项
- 返回原始响应 JSON。

### delete_diary_by_id — 按 ID 删除日记

```
delete_diary_by_id(diary_id: str) -> str
```

### delete_diary_by_date — 按日期删除日记

```
delete_diary_by_date(date: str) -> str
```

---

## 使用示例（提示词）

- 「帮我查一下 2026-06-16 的日记」
- 「看看 6 月 1 号到 6 月 15 号我都写了什么」
- 「今天是 2026-06-17，帮我写一条日记：内容……心情开心，天气晴」
- 「把 ID 是 xxx 的日记内容改成……」
- 「删除 2026-06-10 那天的日记」

---

## 目录说明

- [diarum_mcp.py](file:///workspace/diarum_mcp.py) — MCP Server 主程序
- [requirements.txt](file:///workspace/requirements.txt) — 依赖
- [config.json](file:///workspace/config.json) — 连接配置示例
- [README.md](file:///workspace/README.md) — 更详细的接入说明

---

## 注意事项

- token 通过查询参数 `?token=...` 传递，请不要把 token 提交到公开仓库。
- 请求超时时间为 30 秒。若网络异常，会返回结构化的错误文本，不会使 MCP 会话中断。
- 若 hostname 使用自签名证书或代理，请自行通过系统环境变量（如 `HTTPS_PROXY` / `SSL_CERT_FILE`）配置。
