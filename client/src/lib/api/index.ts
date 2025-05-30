
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl = '/api', defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new ApiError(response.status, errorData || response.statusText);
      }

      const data = await response.json();
      
      return {
        data,
        success: true
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(500, 'Network error occurred');
    }
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Default API client instance
export const api = new ApiClient();

// API endpoints
export const endpoints = {
  // Game data
  game: {
    save: '/game/save',
    load: '/game/load',
    stats: '/game/stats'
  },
  
  // Player data
  player: {
    profile: '/player/profile',
    stats: '/player/stats',
    achievements: '/player/achievements'
  },
  
  // NPCs
  npcs: {
    list: '/npcs',
    create: '/npcs',
    update: (id: string) => `/npcs/${id}`,
    delete: (id: string) => `/npcs/${id}`,
    stats: (id: string) => `/npcs/${id}/stats`
  },
  
  // Buildings
  buildings: {
    list: '/buildings',
    create: '/buildings',
    update: (id: string) => `/buildings/${id}`,
    delete: (id: string) => `/buildings/${id}`
  },
  
  // Resources
  resources: {
    list: '/resources',
    update: '/resources'
  },
  
  // Research
  research: {
    list: '/research',
    unlock: '/research/unlock'
  }
} as const;
