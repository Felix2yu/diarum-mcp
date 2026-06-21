# Diarum MCP 服务器

一个将 Diarum 日记应用与 LobeHub 集成的模型上下文协议 (MCP) 服务器，使 AI 助手能够通过自然语言命令管理日记条目。

## 功能特性

- **读取日记**：按日期查询日记条目、搜索内容或浏览最近的条目
- **创建/更新日记**：编写新的日记条目或更新现有条目
- **AI 驱动的分析**：生成定期摘要和洞察
- **标签管理**：使用标签组织和筛选日记
- **统计功能**：追踪写作习惯和连续记录

## 安装

### 前置要求

- Node.js 18 或更高版本
- 运行中的 Diarum 实例
- Diarum 实例的 API 令牌

### 快速开始

1. 克隆此仓库：
```bash
git clone https://github.com/Felix2yu/diarum-mcp.git
cd diarum-mcp/plugins/diarum-mcp
```

2. 安装依赖：
```bash
npm install
```

3. 构建服务器：
```bash
npm run build
```

4. 配置环境变量：
```bash
export DIARUM_BASE_URL="http://localhost:8090"
export DIARUM_API_TOKEN="你的API令牌"
```

5. 启动服务器：
```bash
npm start
```

## LobeHub 配置

将以下内容添加到你的 LobeHub MCP 配置中：

```json
{
  "mcpServers": {
    "diarum": {
      "command": "node",
      "args": ["/path/to/diarum-mcp/dist/index.js"],
      "env": {
        "DIARUM_BASE_URL": "http://localhost:8090",
        "DIARUM_API_TOKEN": "你的API令牌"
      }
    }
  }
}
```

或者使用 npx 命令：

```json
{
  "mcpServers": {
    "diarum": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-diary"],
      "env": {
        "DIARUM_BASE_URL": "http://localhost:8090",
        "DIARUM_API_TOKEN": "你的API令牌"
      }
    }
  }
}
```

## 可用工具

### 日记操作

| 工具 | 描述 |
|------|------|
| `get_diary_by_date` | 获取特定日期的日记条目 |
| `create_or_update_diary` | 创建或更新日记条目 |
| `search_diaries` | 按内容搜索日记条目 |
| `get_recent_diaries` | 获取最近的日记条目 |
| `delete_diary` | 删除日记条目 |
| `get_diary_stats` | 获取统计数据和连续记录信息 |

### 标签操作

| 工具 | 描述 |
|------|------|
| `get_all_tags` | 获取所有标签及其使用次数 |
| `get_diaries_by_tag` | 按标签筛选日记 |

### 特殊查询

| 工具 | 描述 |
|------|------|
| `on_this_day` | 获取历史同日期的日记 |
| `random_diary` | 获取随机日记条目 |

## 使用示例

配置完成后，你可以在 LobeHub 中通过自然语言与 Diarum 交互：

### 读取日记
- "我昨天写了什么？"
- "显示我上周一的日记"
- "1月15日我在想什么？"

### 写日记
- "为今天的锻炼创建一条日记"
- "用会议记录更新昨天的日记"
- "给今天的日记添加'健身'标签"

### 搜索
- "查找所有关于项目截止日期的日记"
- "搜索提到感到压力的条目"

### 分析
- "分析我这个月的日记条目"
- "我的周记中有什么规律？"

### 回忆
- "一年前的今天我在做什么？"
- "给我看一条过去的随机日记"

## API 参考

完整的 API 文档请参考 [Diarum 文档](https://github.com/Felix2yu/diarum)。

## 开发

### 构建

```bash
npm run build
```

### 监视模式

```bash
npm run dev
```

### 清理

```bash
rm -rf dist node_modules
```

## 故障排除

### 连接问题

1. 验证你的 Diarum 实例正在运行
2. 检查 `DIARUM_BASE_URL` 是否指向正确的地址
3. 确保 API 令牌有效

### 认证失败

1. 重新登录 Diarum 刷新会话
2. 如需要，生成新的 API 令牌
3. 验证令牌具有所需权限

## 许可证

本项目采用 Apache License 2.0 许可证。

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 支持

如有问题和功能请求，请访问 [GitHub 仓库](https://github.com/Felix2yu/diarum-mcp/issues)。
