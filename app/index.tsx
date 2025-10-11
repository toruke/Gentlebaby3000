import { Button } from "@react-navigation/elements";
import { Link } from "expo-router";
import React from 'react';
import { View } from 'react-native';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Link href="/inviteGeneral" asChild>
        <Button>InviteGeneral</Button>
      </Link>

      <View style={{ height: 40}}/>

      <Link href="/inviteFamilyScreen" asChild>
        <Button>Demo prof</Button>
      </Link>

      <View style={{ height: 20 }} />

      <Link href="/invite" asChild>
        <Button>Demo prof 2</Button>
      </Link>
    </View>
  );
}
