// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterStudentData {
    email: string;
    password: string;
    name?: string;
    referral_code?: string;
}

export interface RegisterTeacherData {
    first_name: string;
    last_name: string;
    email: string;
    pseudo: string;
    domain_of_interest: string;
    year: string;
    password: string;
}

export interface AuthResponse {
    user: any;
    token: string;
    teacher?: any;
    student?: any;
}

class ApiClient {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${this.baseURL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        return response.json();
    }

    async registerStudent(data: RegisterStudentData): Promise<AuthResponse> {
        const response = await fetch(`${this.baseURL}/register/student`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.errors ? JSON.stringify(error.errors) : 'Registration failed');
        }

        return response.json();
    }

    async registerTeacher(data: RegisterTeacherData): Promise<any> {
        const response = await fetch(`${this.baseURL}/register/teacher`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.errors ? JSON.stringify(error.errors) : 'Registration failed');
        }

        return response.json();
    }

    async getMe(token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }

        return response.json();
    }

    async logout(token: string): Promise<void> {
        await fetch(`${this.baseURL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    }

    // Student APIs
    async getTeachers(token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/student/teachers`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch teachers');
        }

        return response.json();
    }

    async getTeacherProfile(teacherId: number, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/student/teachers/${teacherId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch teacher profile');
        }

        return response.json();
    }

    async getModuleDetails(moduleId: number, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/modules/${moduleId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch module details');
        }

        return response.json();
    }

    async getStudentModuleDetails(id: number, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/student/modules/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch student module details');
        }

        return response.json();
    }

    async searchModules(params: { search?: string; min_price?: number; max_price?: number }, token: string): Promise<any> {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.min_price !== undefined) queryParams.append('min_price', params.min_price.toString());
        if (params.max_price !== undefined) queryParams.append('max_price', params.max_price.toString());
        
        const response = await fetch(`${this.baseURL}/student/modules?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to search modules');
        }

        return response.json();
    }

    async getWalletBalance(token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/student/wallet`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch wallet balance');
        }

        return response.json();
    }

    async rechargeWallet(amount: number, receipt: File, token: string): Promise<any> {
        const formData = new FormData();
        formData.append('amount', amount.toString());
        formData.append('receipt', receipt);

        const response = await fetch(`${this.baseURL}/student/wallet/recharge`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Recharge failed');
        }

        return response.json();
    }

    async getTransactions(token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/student/wallet/transactions`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }

        return response.json();
    }

    async enrollInModule(data: any, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/student/enroll`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Enrollment failed');
        }

        return response.json();
    }

    async getMyModules(token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/student/my-modules`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch enrolled modules');
        }

        return response.json();
    }

    // Teacher APIs
    async getTeacherModules(token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/modules`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch teacher modules');
        }

        return response.json();
    }

    async createModule(data: any, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/modules`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create module');
        }

        return response.json();
    }

    async updateModule(moduleId: number, data: any, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/modules/${moduleId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update module');
        }

        return response.json();
    }

    async deleteModule(moduleId: number, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/modules/${moduleId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete module');
        }

        return response.json();
    }

    async getTeacherEnrollments(token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/enrollments`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch enrollments');
        }

        return response.json();
    }

    // Dashboard methods
    async getTeacherDashboardStats(token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }

        return response.json();
    }

    async getTeacherEarnings(token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/dashboard/earnings`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch earnings data');
        }

        return response.json();
    }

    // Folder management
    async createFolder(moduleId: number, data: any, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/modules/${moduleId}/folders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create folder');
        }

        return response.json();
    }

    async updateFolder(folderId: number, data: any, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/folders/${folderId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update folder');
        }

        return response.json();
    }

    async deleteFolder(folderId: number, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/folders/${folderId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete folder');
        }

        return response.json();
    }

    // Resource management
    async uploadResource(folderId: number, data: FormData, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/folders/${folderId}/resources`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                // Don't set Content-Type for FormData - browser will set it with boundary
            },
            body: data,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to upload resource');
        }

        return response.json();
    }

    async updateResource(resourceId: number, data: any, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/resources/${resourceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update resource');
        }

        return response.json();
    }

    async deleteResource(resourceId: number, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/resources/${resourceId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete resource');
        }

        return response.json();
    }

    async getResourceView(resourceId: number, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/resources/${resourceId}/view`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to access resource');
        }

        return response.json();
    }

    // Withdrawal management
    async getTeacherWithdrawals(token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/withdrawals`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch withdrawals');
        }

        return response.json();
    }

    async requestWithdrawal(data: { amount: number; payment_method: string; payment_details: string }, token: string): Promise<any> {
        const response = await fetch(`${this.baseURL}/teacher/withdrawals`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to request withdrawal');
        }

        return response.json();
    }
}

export const api = new ApiClient();
