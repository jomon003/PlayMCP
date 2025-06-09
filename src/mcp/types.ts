export interface Tool {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
}

export interface ServerConfig {
    name: string;
    version: string;
}

export interface ServerCapabilities {
    capabilities: {
        tools: Record<string, Tool>;
    };
}

export interface CallToolRequest {
    params: {
        name: string;
        arguments?: Record<string, any>;
    };
}

export interface ToolResponse {
    content: Array<{
        type: string;
        text: string;
    }>;
    isError?: boolean;
}

export interface ListToolsResponse {
    tools: Tool[];
}