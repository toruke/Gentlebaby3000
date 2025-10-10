import { router } from "expo-router";
import React from "react";
import {
    TouchableOpacity,
    View
} from "react-native";

export default function InviteGeneral() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
                onPress={() => router.back()}></TouchableOpacity>
        </View>
    );
};

