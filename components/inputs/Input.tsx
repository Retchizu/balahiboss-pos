/* eslint-disable import/namespace */
import { View, TextInput, InputModeOptions } from "react-native";
import React from "react";
import { strongPrimary } from "@/theme/backgroundTheme";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import * as Icons from "@expo/vector-icons";

type InputProp = {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    icon?: {
        name: string;
        family: keyof typeof Icons;
        color?: string;
        size?: number;
    };
    row?: boolean
    inputType?: InputModeOptions;
};

const Input = ({ placeholder, value, onChangeText, icon, row, inputType}: InputProp) => {
    const IconComponent =
        icon?.family && Icons[icon.family] ? (Icons[icon.family] as any) : null;

    return (
        <View
            style={{
                borderColor: strongPrimary,
                borderWidth: wp(0.3),
                borderRadius: wp(2),
                flexDirection: "row",
                alignItems:'center',
                padding:wp(1),
                flex: row ? 1 : undefined
            }}
        >
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={"rgba(0,0,0,0.5)"}
                value={value}
                onChangeText={onChangeText}
                style={{ fontFamily: "Gantari-Regular", fontSize: wp(4.5), flex:1 }}
                inputMode={inputType ?? "text"}
            />
            {IconComponent && icon?.name && (
                <IconComponent
                    name={icon.name}
                    size={icon.size ?? wp(8)}
                    color={icon.color ?? strongPrimary}
                    style={{ marginLeft: wp(2) }}
                />
            )}
        </View>
    );
};

export default Input;
