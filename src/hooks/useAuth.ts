import { useCallback, useState } from "react";

import {
	getMe,
	login as loginRequest,
	logout as logoutRequest,
	type LoginRequest,
	type User,
} from "../api/authApi";
import { AUTH_COOKIE_NAMES, getCookie, setCookie } from "../utils/cookies";
import { clearAuth } from "../utils/permission";

interface UseAuthResult {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	login: (credentials: LoginRequest) => Promise<User>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<User | null>;
}

const getStoredUser = (): User | null => {
	localStorage.removeItem("accessToken");
	localStorage.removeItem("refreshToken");

	const storedUser = localStorage.getItem("user");

	if (!storedUser) {
		return null;
	}

	try {
		return JSON.parse(storedUser) as User;
	} catch {
		clearAuth();
		return null;
	}
};

const storeAuth = (
	accessToken: string | undefined,
	refreshToken: string | undefined,
	user: User
) => {
	if (accessToken) {
		setCookie(AUTH_COOKIE_NAMES.accessToken, accessToken);
	}
	if (refreshToken) {
		setCookie(AUTH_COOKIE_NAMES.refreshToken, refreshToken);
	}
	localStorage.setItem("user", JSON.stringify(user));
	localStorage.setItem("userRole", user.role);
};

export const useAuth = (): UseAuthResult => {
	const [user, setUser] = useState<User | null>(() => {
		return getStoredUser();
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const refreshUser = useCallback(async (): Promise<User | null> => {
		try {
			const currentUser = await getMe();
			localStorage.setItem("user", JSON.stringify(currentUser));
			localStorage.setItem("userRole", currentUser.role);
			setUser(currentUser);
			return currentUser;
		} catch {
			clearAuth();
			setUser(null);
			return null;
		}
	}, []);

	const login = useCallback(async (credentials: LoginRequest) => {
		setError(null);
		setIsLoading(true);

		try {
			const response = await loginRequest(credentials);
			storeAuth(
				response.accessToken,
				response.refreshToken,
				response.user
			);
			setUser(response.user);
			return response.user;
		} catch (requestError) {
			const message =
				requestError instanceof Error
					? requestError.message
					: "Unable to sign in.";

			setError(message);
			throw requestError;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const logout = useCallback(async () => {
		const refreshToken = getCookie(AUTH_COOKIE_NAMES.refreshToken);

		setError(null);

		try {
			await logoutRequest(refreshToken ?? undefined);
		} catch (requestError) {
			setError(
				requestError instanceof Error
					? requestError.message
					: "Unable to sign out."
			);
		} finally {
			clearAuth();
			setUser(null);
		}
	}, []);

	return {
		user,
		isAuthenticated: Boolean(user),
		isLoading,
		error,
		login,
		logout,
		refreshUser,
	};
};

export default useAuth;
