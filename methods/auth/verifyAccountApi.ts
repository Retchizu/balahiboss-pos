import { api } from "@/config/axios-api";

export const verifyAccountApi = async () => {
    try {
        const response = await api.get("/user/verify")
        return response.data
    } catch (error) {
        throw error;
    }
}