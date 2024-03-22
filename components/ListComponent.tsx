import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { SearchBar } from "@rneui/base";
import { Fontisto } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  navigation: any;
  placeholder: string;
  navigateTo: string;
  identifier: string;
  params?: any;
};

const ListComponent = ({
  searchQuery,
  setSearchQuery,
  navigation,
  placeholder,
  navigateTo,
  identifier,
  params,
}: Props) => {
  const iconSeparator = () => {
    switch (identifier) {
      case "product":
        return <Fontisto name="shopping-basket-add" size={24} color="pink" />;
      case "customer":
        return <Ionicons name="person-add-sharp" size={24} color="pink" />;
      case "pos":
        return <Fontisto name="shopping-basket" size={24} color="pink" />;
    }
  };

  return (
    <View>
      <View style={styles.header}>
        <SearchBar
          placeholder={placeholder}
          containerStyle={{
            backgroundColor: "#f7f7f7",
            borderColor: "#f7f7f7",
            flex: 1,
          }}
          inputContainerStyle={{ backgroundColor: "#f7f2f7", flex: 1 }}
          round
          autoCapitalize="none"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <View
          style={{
            padding: 10,
            marginTop: 5,
            marginRight: 5,
            backgroundColor: "#f7f2f7",
            borderRadius: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate(navigateTo, params)}
          >
            {iconSeparator()}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ListComponent;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
  },
});
