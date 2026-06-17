# diarum-mcp

用于 LobeHub 的日记 MCP Server。提供日记的增删改查能力，基于 `mcp` Python SDK (FastMCP) 实现，通过标准输入输出与 LobeHub 通信。

## 功能

- `get_diary(date)` — 按日期获取日记
- `get_diary_range(start, end)` — 按日期范围获取日记
- `create_or_update_diary(date, content, mood, weather)` — 创建或更新日记
- `update_diary_by_id(diary_id, content, mood, weather)` — 按 ID 更新日记
- `delete_diary_by_id(diary_id)` — 按 ID 删除日记
- `delete_diary_by_date(date)` — 按日期删除日记

## 安装

```bash
pip install -r requirements.txt
```

## 配置

有两种方式提供日记服务的地址与 token：

1. 环境变量：

   ```bash
   export DIARUM_HOSTNAME="your-diarum-host.example.com"
   export DIARUM_TOKEN="YOUR_API_TOKEN_HERE"
   ```

2. `config.json`（与脚本同目录）：

   ```json
   {
     "hostname": "your-diarum-host.example.com",
     "token": "YOUR_API_TOKEN_HERE"
   }
   ```

   也可通过环境变量 `DIARUM_CONFIG` 指定其他路径。

若 `hostname` 未带协议，默认使用 `https`。

## 在 LobeHub 中添加

在 LobeHub 的 MCP 配置中添加一个新的 Server，`command` 填 `python3`，`args` 填脚本的绝对路径，例如：

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

如使用虚拟环境，请将 `command` 改为 venv 中 python 解释器的绝对路径，或在 `args` 前通过环境变量激活。

## 本地验证

```bash
python3 diarum_mcp.py test
```

该命令会尝试拉取示例日期的日记，并打印原始响应。

## 实现文件

- [diarum_mcp.py](file:///workspace/diarum_mcp.py)
- [requirements.txt](file:///workspace/requirements.txt)
- [config.json](file:///workspace/config.json)
