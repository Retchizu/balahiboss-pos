import { db } from "@/config/firebaseConfig";
import { useCustomerContext } from "@/contexts/CustomerContext";
import { onValue, ref } from "firebase/database";
import { useEffect } from "react";

const useGetCustomers = () => {
    const { customers, setCustomers } =
        useCustomerContext();

    useEffect(() => {
        const customerRef = ref(db, "customers");
        const unsubscribe = onValue(customerRef, async (snapshot) => {
            setCustomers(snapshot.val());
        });
        return () => unsubscribe();
    }, [setCustomers]);

    return { customers };
};

export default useGetCustomers;
