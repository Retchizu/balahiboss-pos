import { auth } from "@/config/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosHeaders } from "axios";


const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;

    if (user) {
        const token = await user.getIdToken();
        await AsyncStorage.setItem("token", token);
        config.headers = AxiosHeaders.from({
            ...config.headers || {},
            Authorization: `Bearer ${token}`
        })
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;

        // If 401 and it's the first retry attempt
        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest?._retry
        ) {
            originalRequest._retry = true;

            try {
                const user = auth.currentUser;
                if (user) {
                    const newToken = await user.getIdToken(true);
                    await AsyncStorage.setItem("token", newToken);

                    originalRequest.headers = AxiosHeaders.from({
                        ...originalRequest.headers,
                        Authorization: `Bearer ${newToken}`,
                    });

                    return api(originalRequest);
                }
            } catch (error) {
                console.error("Token Refresh Failed", error);
            }
        }
        return Promise.reject(error);
    }
);

export {api};