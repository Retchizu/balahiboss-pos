import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useProductContext } from "../context/productContext";
import { useMemo, useState } from "react";
import { SearchBar } from "@rneui/base";

const LowStockReportScreen = () => {
  const { products } = useProductContext();
  const lowStockList = products.filter((item) => item.stock <= 1);

  const [searchQuery, setSearchQuery] = useState("");
  const filteredData = useMemo(() => {
    const filteredItems = lowStockList.filter((item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedFilteredItems = filteredItems.sort((a, b) =>
      a.productName.toString().localeCompare(b.productName.toString())
    );

    return sortedFilteredItems;
  }, [products, searchQuery]);
  return (
    <SafeAreaView style={{ backgroundColor: "#f7f7f7", flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: "600", textAlign: "center" }}>
        Low Stock
      </Text>
      <SearchBar
        placeholder={"Search Product"}
        containerStyle={{
          backgroundColor: "white",
          borderColor: "white",
        }}
        inputContainerStyle={{ backgroundColor: "#f7f2f7" }}
        round
        autoCapitalize="none"
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginHorizontal: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Product name</Text>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Stock</Text>
      </View>
      <FlatList
        style={{ marginHorizontal: 10 }}
        data={filteredData}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              borderBottomColor: "gray",
              borderBottomWidth: 1,
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.productName}</Text>
            <Text style={{ fontSize: 16 }}>{item.stock}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default LowStockReportScreen;

const styles = StyleSheet.create({});
