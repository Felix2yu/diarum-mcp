# diarum-mcp

用于将 [Diarum](https://github.com/Felix2yu/diarum) 日记应用与 LobeHub 集成的模型上下文协议 (MCP) 服务器。

## 概述

本项目提供了一个 MCP 服务器，使 AI 助手能够通过自然语言命令与 Diarum 日记条目进行交互。用户可以直接从 LobeHub 读取、创建、搜索和分析他们的日记条目。

## 功能特性

- **读取日记**：按日期查询日记条目、搜索内容或浏览最近的条目
- **创建/更新日记**：编写新的日记条目或更新现有条目，支持内容、心情、天气和标签
- **AI 驱动的分析**：从日记条目生成定期摘要和洞察
- **标签管理**：使用标签组织和筛选日记
- **统计功能**：追踪写作习惯和连续记录
- **特殊查询**：访问"历史上的今天"和随机日记条目

## 快速开始

1. 进入插件目录：
```bash
cd plugins/diarum-mcp
```

2. 安装依赖：
```bash
npm install
```

3. 构建服务器：
```bash
npm run build
```

4. 配置并启动（详见 [plugins/diarum-mcp/README.md](plugins/diarum-mcp/README.md)）

## 项目结构

```
diarum-mcp/
├── plugins/
│   └── diarum-mcp/
│       ├── .codex-plugin/
│       │   └── plugin.json      # 插件清单
│       ├── .mcp.json            # MCP 服务器配置
│       ├── skills/
│       │   └── SKILL.md         # 完整的技能文档
│       ├── src/
│       │   └── index.ts         # MCP 服务器实现
│       ├── package.json         # Node.js 依赖
│       ├── tsconfig.json        # TypeScript 配置
│       └── README.md            # 详细使用说明
└── README.md                    # 本文件
```

## 文档

- **[SKILL.md](plugins/diarum-mcp/skills/SKILL.md)**：所有可用工具的完整文档和使用示例
- **[插件 README](plugins/diarum-mcp/README.md)**：安装和配置指南

## 许可证

本项目采用 Apache License 2.0 许可证。

## 致谢

- [Diarum](https://github.com/Felix2yu/diarum) - 本 MCP 服务器集成的日记应用
- [LobeHub](https://lobehub.com/) - AI 助手平台
- [模型上下文协议](https://modelcontextprotocol.io/) - 协议规范
