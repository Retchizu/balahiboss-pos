import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import React from "react";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import AntDesign from "@expo/vector-icons/AntDesign";

type GoogleSignInProp = TouchableOpacityProps & {
    isLoading: boolean;
};

const GoogleSignInButton = ({ isLoading, ...props }: GoogleSignInProp) => {
    return (
        <TouchableOpacity
            style={{
                backgroundColor: "#EA4335",
                padding: 10,
                borderRadius: 10,
                width: wp(80),
                height: hp(7),
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
            }}
            activeOpacity={0.7}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
            ) : (
                <>
                    <AntDesign name="google" size={wp(5)} color="#FFF" />
                    <Text
                        style={{
                            fontFamily: "Gantari-Bold",
                            fontSize: wp(5),
                            color: "#FFF",
                            marginLeft: wp(2),
                        }}
                    >
                        Sign In
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

export default GoogleSignInButton;
