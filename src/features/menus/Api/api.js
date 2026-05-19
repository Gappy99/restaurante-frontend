import axios from "axios";
import useAuthStore from "../../../shared/stores/useAuthStore";

const axiosAuth = axios.create({
    baseURL:
        import.meta.env.VITE_AUTH_URL ||
        'http://localhost:3000/GestorRestaurante/v1/auth',
    timeout: 8000,
    headers: {
        "Content-Type": "application/json"
    }
});

const axiosAdmin = axios.create({
    baseURL:
        import.meta.env.VITE_ADMIN_URL ||
        'http://localhost:3000/GestorRestaurante/v1',
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
});

const addTokenToRequest = (config, clientType) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config._axiosClient = clientType
    return config;
};

axiosAuth.interceptors.request.use((config) => addTokenToRequest(config, 'auth'));
axiosAdmin.interceptors.request.use((config) => addTokenToRequest(config, 'admin'));

let _isRefreshing = false;
let failedQueue = [];

function _processQueue(_error, token = null) {
    failedQueue.forEach(({ resolve, reject }) =>
        _error ? reject(_error) : resolve(token),
    );
    failedQueue = [];
}

const handleRefreshToken = async function (_error) {
    const _original = _error.config;
    if (!_original || _original._retry) {
        return Promise.reject(_error);
    }
    const status = _error.response?.status;
    const errorCode = _error.response?.data?.error;
    const requestUrl = _original.url || "";
    const isRefreshEndpoint = requestUrl.includes("/auth/refresh");
    const shouldAttemptRefresh = !isRefreshEndpoint && status === 401;
    const shouldAttemptRefreshFrom403 = !isRefreshEndpoint && status === 403 && errorCode === "TOKEN_EXPIRED";

    if (shouldAttemptRefresh || shouldAttemptRefreshFrom403) {
        const retryClient = _original._axiosClient === "admin" ? axiosAdmin : axiosAuth;
        if (_isRefreshing) {
            return new Promise(function (resolve, reject) {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    _original.headers["Authorization"] = "Bearer " + token;
                    return retryClient(_original);
                })
                .catch((err) => Promise.reject(err));
        }
        _original._retry = true;
        _isRefreshing = true;
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
            useAuthStore.getState().logout();
            return Promise.reject(_error);
        }
        try {
            const refreshUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:3000/GestorRestaurante/v1/auth';
            const response = await axiosAuth.post(`${refreshUrl}/refresh`, { refreshToken });
            const { accessToken, refreshToken: newRefreshToken, expiresIn, userDetails } = response.data;
            useAuthStore.setState({
                token: accessToken,
                refreshToken: newRefreshToken,
                expiresAt: expiresIn,
                user: userDetails || useAuthStore.getState().user,
                isAuthenticated: true,
            });
            _processQueue(null, accessToken);
            _original.headers["Authorization"] = "Bearer " + accessToken;
            return retryClient(_original);
        } catch (err) {
            _processQueue(err, null);
            useAuthStore.getState().logout();
            return Promise.reject(err);
        } finally {
            _isRefreshing = false;
        }
    }
    return Promise.reject(_error);
};

axiosAuth.interceptors.response.use((res) => res, handleRefreshToken);
axiosAdmin.interceptors.response.use((res) => res, handleRefreshToken);

export { axiosAuth, axiosAdmin, handleRefreshToken };