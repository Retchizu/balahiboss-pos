
import { api } from "@/config/axios-api";
import { db } from "@/config/firebaseConfig";
import { useProductContext } from "@/contexts/ProductContext";
import { useRecentTrasactionContext } from "@/contexts/RecentTransactionContext";
import { onValue, ref } from "firebase/database";
import { useEffect } from "react";

const useGetProducts = () => {
    const { setProducts, products } =
        useProductContext();
    const {setRecentTranscations} = useRecentTrasactionContext();

    useEffect(() => {
        const productRef = ref(db, "products");
        const unsubscribe = onValue(productRef, async (snapshot) => {
            setProducts(snapshot.val())
            
            const getRecentTransaction = async() => {
                try {
                    const response = await api.get("/transaction/list");
                    setRecentTranscations(response.data.items);
                } catch (error) {
                    console.log(error)
                }

            };
            await getRecentTransaction();
        })

        return () => unsubscribe()
    }, [setProducts, setRecentTranscations]);

    return {products};
};

export default useGetProducts;
