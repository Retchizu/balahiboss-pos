import { api } from "@/config/axios-api";

export const signOutUser = async () => {
    try {
        const response = await api.get("/user/sign-out")
        return response.data
    } catch (error) {
        throw error;
    }
}