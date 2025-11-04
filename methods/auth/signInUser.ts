import { api } from "@/config/axios-api";

export const signInUser = async () => {
    try {
        const response = await api.get("/user/sign-in")
        return response.data
    } catch (error) {
        throw error;
    }
}