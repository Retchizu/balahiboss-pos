import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import SearchBar from "@/components/searchbars/SearchBar";
import FloatingButton from "@/components/buttons/FloatingButton";
import { router } from "expo-router";
import Category from "@/types/Category";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { firestoreDb } from "@/config/firebaseConfig";
import Toast from "react-native-toast-message";

// TODO: Replace with actual category context/hook when implemented
const CategoryListScreen = () => {
  const { primary, strongPrimary, textMuted, textOnStrongPrimary } =
    useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Set up Firestore listener for real-time category updates
    const categoriesCollectionRef = query(collection(firestoreDb, "categories"), orderBy("displayOrder", "asc"))
    
    const unsubscribe = onSnapshot(
      categoriesCollectionRef,
      (snapshot) => {
        const categoriesData: Category[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        
        setCategories(categoriesData);
      },
      (error) => {
        Toast.show({
          type: "error",
          text1: "Error fetching categories",
        });
        console.error("Error listening to categories:", error);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);
  
  const filteredCategories = categories.filter((category) =>
    category.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(5),
      }}
    >
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search Categories..."
      />
      <FlatList
        data={filteredCategories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.85)",
              borderWidth: 1,
              borderColor: textMuted,
              marginVertical: hp(1),
              padding: wp(2),
              borderRadius: wp(4),
            }}
            activeOpacity={0.7}
            onPress={() => {router.navigate(`../${item.id}`)}}
          >
            <Text
              style={{
                fontSize: wp(4),
                fontFamily: "Gantari-SemiBold",
                flex: 1
              }}
            >
              {item.displayOrder}. {item.categoryName}
            </Text>
            <View
              style={{
                flex: 1,
                alignSelf: "stretch",
                backgroundColor: item.color || "transparent",
                marginLeft: wp(2),
                borderRadius: wp(2),
              }}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: hp(20),
            }}
          >
            <Text
              style={{
                fontSize: wp(4),
                fontFamily: "Gantari-Regular",
                color: textMuted,
              }}
            >
              No categories found
            </Text>
          </View>
        }
      />
      <FloatingButton
        onPress={() => router.navigate("../add")}
        icon={{ name: "plus", family: "Entypo", color: textOnStrongPrimary, size: wp(6) }}
        backgroundColor={strongPrimary}
      />
    </View>
  );
};

export default CategoryListScreen;

