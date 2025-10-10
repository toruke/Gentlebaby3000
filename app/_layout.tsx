import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack>
            <Stack.Screen
                name="inviteGeneral"
                options={{ title: "Invitez un Proche" }} // <-- Modifier ici
            />
        </Stack>
}
