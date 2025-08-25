// Login
export interface LoginRequest {
    email: string;
    password: string;
}

// 🔥 Backend LoginResponseDto - Bu 4 field kesin var
export interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    expiresAt: string;
    user: {
        userId: number;
        username: string;
        email: string;
        nameSurname: string;
        avatarUrl: string | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        roleId: number;
        roleName: string;
    };
}
// Register
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    nameSurname: string;
}

// 🔥 Backend RegisterResponseDto - Bu 3 field kesin var
export interface RegisterResponse {
    success: boolean;
    message: string;
    user?: {
        userId: number;
        username: string;
        email: string;
        nameSurname: string;
    };
}

// Logout
export interface LogoutRequest {
    refreshToken?: string;
    logoutFromAllDevices?: boolean;
}

// 🔥 Backend LogoutResponseDto
export interface LogoutResponse {
    success: boolean;
    message?: string;
}

// 🔥 Backend ForgotPasswordResponseDto
export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message?: string;
}

// 🔥 Backend ResetPasswordResponseDto
export interface ResetPasswordRequest {
    email: string;
    token: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message?: string;
}

// Error
export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: any;
}
// User interface (yeniden kullanılabilir)
export interface User {
    userId: number;
    username: string;
    email: string;
    nameSurname: string;
    avatarUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    roleId: number;
    roleName: string;
}