#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const DIARUM_BASE_URL = process.env.DIARUM_BASE_URL || "http://localhost:8090";
const DIARUM_API_TOKEN = process.env.DIARUM_API_TOKEN || "";

interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  mood: string;
  weather: string;
  tags: string[];
  owner: string;
  created: string;
  updated: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${DIARUM_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DIARUM_API_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  return response.json() as Promise<T>;
}

const server = new Server(
  {
    name: "diarum-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_diary_by_date",
        description: "Retrieve a diary entry for a specific date",
        inputSchema: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "Date in YYYY-MM-DD format",
            },
          },
          required: ["date"],
        },
      },
      {
        name: "create_or_update_diary",
        description: "Create a new diary entry or update an existing one",
        inputSchema: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "Date in YYYY-MM-DD format",
            },
            content: {
              type: "string",
              description: "Diary content in Markdown format",
            },
            mood: {
              type: "string",
              description: "Mood emoji or text",
            },
            weather: {
              type: "string",
              description: "Weather description",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Tags for categorization",
            },
          },
          required: ["date", "content"],
        },
      },
      {
        name: "search_diaries",
        description: "Search diary entries by content",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query",
            },
            limit: {
              type: "number",
              description: "Maximum results (default: 50)",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_recent_diaries",
        description: "Get recent diary entries",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Number of entries to retrieve (default: 5, max: 100)",
            },
          },
        },
      },
      {
        name: "delete_diary",
        description: "Delete a diary entry",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Diary entry ID",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "get_diary_stats",
        description: "Get diary statistics including total entries and current streak",
        inputSchema: {
          type: "object",
          properties: {
            timezone: {
              type: "string",
              description: "Timezone for streak calculation",
            },
          },
        },
      },
      {
        name: "get_all_tags",
        description: "Retrieve all tags with their usage counts",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_diaries_by_tag",
        description: "Get all diary entries with a specific tag",
        inputSchema: {
          type: "object",
          properties: {
            tag: {
              type: "string",
              description: "Tag name",
            },
          },
          required: ["tag"],
        },
      },
      {
        name: "on_this_day",
        description: "Get diary entries from the same date in previous years",
        inputSchema: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "Date to check (default: today)",
            },
          },
        },
      },
      {
        name: "random_diary",
        description: "Get a random diary entry for reflection",
        inputSchema: {
          type: "object",
          properties: {
            exclude_date: {
              type: "string",
              description: "Date to exclude from random selection",
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = (args || {}) as Record<string, string | number | boolean | string[]>;

  try {
    switch (name) {
      case "get_diary_by_date": {
        const diary = await apiRequest<DiaryEntry>(
          `/api/v1/diaries/by-date/${a.date}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(diary, null, 2),
            },
          ],
        };
      }

      case "create_or_update_diary": {
        const diary = await apiRequest<DiaryEntry>("/api/v1/diaries/upsert", {
          method: "POST",
          body: JSON.stringify({
            date: a.date,
            content: a.content,
            mood: a.mood || "",
            weather: a.weather || "",
            tags: a.tags || [],
          }),
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(diary, null, 2),
            },
          ],
        };
      }

      case "search_diaries": {
        const results = await apiRequest<{ results: DiaryEntry[]; total: number }>(
          `/api/v1/diaries/search?q=${encodeURIComponent(String(a.query))}&limit=${a.limit || 50}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case "get_recent_diaries": {
        const diaries = await apiRequest<{ diaries: DiaryEntry[] }>(
          `/api/v1/diaries/recent?limit=${a.limit || 5}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(diaries, null, 2),
            },
          ],
        };
      }

      case "delete_diary": {
        await apiRequest(`/api/v1/diaries/${a.id}`, {
          method: "DELETE",
        });
        return {
          content: [
            {
              type: "text",
              text: "Diary entry deleted successfully",
            },
          ],
        };
      }

      case "get_diary_stats": {
        const stats = await apiRequest<{ total: number; streak: number }>(
          `/api/v1/diaries/stats${a.timezone ? `?tz=${a.timezone}` : ""}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      }

      case "get_all_tags": {
        const tags = await apiRequest<{ tags: { tag: string; count: number }[]; total: number }>(
          "/api/v1/diaries/tags"
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(tags, null, 2),
            },
          ],
        };
      }

      case "get_diaries_by_tag": {
        const diaries = await apiRequest<{ tag: string; diaries: DiaryEntry[]; total: number }>(
          `/api/v1/diaries/by-tag/${encodeURIComponent(String(a.tag))}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(diaries, null, 2),
            },
          ],
        };
      }

      case "on_this_day": {
        const result = await apiRequest<{ date: string; total: number; diaries: DiaryEntry[] }>(
          `/api/v1/diaries/on-this-day${a.date ? `?date=${a.date}` : ""}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "random_diary": {
        const result = await apiRequest<{ exists: boolean; diary?: DiaryEntry }>(
          `/api/v1/diaries/random${a.exclude_date ? `?exclude_date=${a.exclude_date}` : ""}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Diarum MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
