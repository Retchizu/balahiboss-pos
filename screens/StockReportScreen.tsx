import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProductContext } from "../context/productContext";
import { SearchBar } from "@rneui/base";
import { Product } from "../type";

const StockReportScreen = () => {
  const { products } = useProductContext();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    const filteredItems = products.filter((item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedFilteredItems = filteredItems.sort((a, b) =>
      a.productName.toString().localeCompare(b.productName.toString())
    );

    return sortedFilteredItems;
  }, [products, searchQuery]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
      <View style={{ marginHorizontal: 10, flex: 1 }}>
        <View style={{ marginHorizontal: 10 }}></View>
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
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ flex: 1, fontSize: 18, fontWeight: "bold" }}>
            Product Name
          </Text>
          <Text style={{ flex: 1, fontSize: 18, fontWeight: "bold" }}>
            Current Stock
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Total Stock Sold
          </Text>
        </View>
        <FlatList
          data={filteredData}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderBottomWidth: 2,
              }}
            >
              <Text style={{ fontSize: 16, flex: 1 }}>{item.productName}</Text>
              <Text style={{ fontSize: 16, flex: 2 }}>{item.stock}</Text>
              <Text style={{ fontSize: 16 }}>{item.totalStockSold}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default StockReportScreen;

const styles = StyleSheet.create({});
