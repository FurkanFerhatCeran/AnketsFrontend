// Login
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        userId: number;
        username: string;
        email: string;
        nameSurname: string;
        avatarUrl?: string;
        isActive: boolean;
        roleId: number;
        roleName: string;
        createdAt: string;
        updatedAt: string;
    };
}

// Register
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    nameSurname: string;
}

// Logout
export interface LogoutRequest {
    refreshToken: string;
    logoutFromAllDevices: boolean;
}

export interface LogoutResponse {
    success: boolean;
    message: string;
}

// Error
export interface ApiErrorResponse {
    message: string;
}