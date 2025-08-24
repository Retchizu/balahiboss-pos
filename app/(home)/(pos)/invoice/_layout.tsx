import React from "react";
import { Stack } from "expo-router";
import { InvoiceFormProvider } from "@/contexts/InvoiceFormContext";

const InvoiceStackLayout = () => {
    return (
        <InvoiceFormProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="preview" />
            </Stack>
        </InvoiceFormProvider>
    );
};

export default InvoiceStackLayout;
