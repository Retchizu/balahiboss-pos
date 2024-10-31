import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import Searchbar from "../../../components/Searchbar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useDraftContext } from "../../../context/DraftContext";
import { readableDate } from "../../../methods/time-methods/readableDate";
import { getDraftData } from "../../../methods/data-methods/getDraftData";
import { useToastContext } from "../../../context/ToastContext";
import { useUserContext } from "../../../context/UserContext";
import { DraftScreenProp, InvoiceDraft } from "../../../types/type";
import Toast from "react-native-toast-message";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  deleteDraftData,
  deleteMultipleDraftData,
} from "../../../methods/data-methods/deleteDraftData";
import { filterSearchForDraft } from "../../../methods/search-filters/filterSearchForDraft";

const DraftScreen = ({ navigation, route }: DraftScreenProp) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { drafts, setDraftList } = useDraftContext();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToastContext();
  const { user } = useUserContext();

  const [isLongPressToggled, setIsLongPressToggled] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<InvoiceDraft[]>([]);
  const filteredData = filterSearchForDraft(drafts, searchQuery);

  useEffect(() => {
    getDraftData(user, setIsLoading, setDraftList, showToast);
  }, []);

  const renderDraftList = useCallback(
    ({ item }: { item: InvoiceDraft }) => (
      <TouchableOpacity
        style={[
          styles.draftContainer,
          {
            backgroundColor: selectedDraft.some((draft) => draft.id === item.id)
              ? "#94e6b7"
              : "#F3F0E9",
          },
        ]}
        onLongPress={() => {
          setIsLongPressToggled(true);
          setSelectedDraft((prev) => [...prev, item]);
        }}
        onPress={() => {
          if (isLongPressToggled) {
            selectedDraft.some((draft) => draft.id === item.id)
              ? setSelectedDraft(
                  selectedDraft.filter((draft) => draft.id !== item.id)
                )
              : setSelectedDraft((prev) => [...prev, item]);
          } else {
            navigation.navigate("DraftInfoScreen", {
              ...item,
              invoiceForm: {
                ...item.invoiceForm,
                date: item.invoiceForm.date
                  ? item.invoiceForm.date.toISOString()
                  : null,
              },
              createdAt: item.createdAt.toISOString(),
            });
          }
        }}
        activeOpacity={0.5}
      >
        <Text style={styles.draftTitleStyle}>{item.draftTitle}</Text>
        <Text style={styles.dateStyle}>{readableDate(item.createdAt)}</Text>
      </TouchableOpacity>
    ),
    [drafts, selectedDraft, searchQuery]
  );
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.headerContainer,
          { paddingRight: isLongPressToggled ? wp(30) : wp(10) },
        ]}
      >
        <Searchbar
          searchBarValue={searchQuery}
          setSearchBarValue={setSearchQuery}
          placeholder="Search a draft"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity
          style={{ padding: wp(2) }}
          onPress={() => {
            setIsLongPressToggled(true);
            setSelectedDraft(drafts);
          }}
        >
          <MaterialCommunityIcons name="check-all" size={24} color="black" />
        </TouchableOpacity>

        {isLongPressToggled && (
          <>
            <TouchableOpacity
              style={{
                padding: wp(2),
                opacity: selectedDraft.length ? 1 : 0.2,
              }}
              onPress={async () => {
                try {
                  if (selectedDraft.length) {
                    deleteMultipleDraftData(
                      user,
                      drafts,
                      setDraftList,
                      selectedDraft,
                      showToast
                    );
                    setSelectedDraft([]);
                    setIsLongPressToggled(false);
                    showToast(
                      "success",
                      "All selected drafts have been deleted."
                    );
                  }
                } catch (error) {
                  showToast("error", "Error occured, try again later.");
                }
              }}
            >
              <Entypo name="trash" size={24} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ padding: wp(2) }}
              onPress={() => {
                setSelectedDraft([]);
                setIsLongPressToggled(false);
              }}
            >
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator
          color={"#634F40"}
          size={wp(10)}
          style={{ flex: 1 }}
        />
      ) : !drafts.length ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text
            style={{
              textAlign: "center",
              fontFamily: "SoraSemiBold",
              fontSize: wp(4),
            }}
          >
            You have no drafts saved
          </Text>
        </View>
      ) : (
        <FlatList data={filteredData} renderItem={renderDraftList} />
      )}
      <Toast position="bottom" autoHide visibilityTime={2000} />
    </View>
  );
};

export default DraftScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F0E9",
    paddingHorizontal: wp(4),
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: wp(30),
  },
  draftContainer: {
    borderWidth: wp(0.3),
    borderColor: "#634F40",
    padding: wp(2),
    marginVertical: hp(0.5),
    borderRadius: wp(1.5),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  draftTitleStyle: {
    flex: 1,
    fontFamily: "SoraSemiBold",
    fontSize: wp(4),
  },
  dateStyle: {
    fontFamily: "SoraMedium",
    fontSize: wp(3.5),
  },
});
