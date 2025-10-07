// ConnexionScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { TEST_USERS } from "./users"; // ajuster le chemin si nécessaire

const ConnexionScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  // erreurs/états affichés APRES appui sur "Se connecter"
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // focus states pour l'effet visuel (border / background)
  const [emailFocus, setEmailFocus] = useState(false);
  const [mdpFocus, setMdpFocus] = useState(false);

  // Couleurs dynamiques
  const getBorderColor = (focus: boolean, error: string) => {
    if (error) return "#e74c3c"; // rouge erreur
    if (focus) return "#8B6D5C"; // brun doux focus
    return "#D8CFC4"; // beige par défaut
  };

  const getBackgroundColor = (focus: boolean) => {
    if (focus) return "#F5EDE0";
    return "#FDF8F2";
  };

  const isButtonDisabled = !email || !motDePasse || loading;

  const handleLogin = () => {
    // reset erreurs/success affichés précédemment
    setEmailError("");
    setPasswordError("");
    setSuccessMessage("");

    // on vérifie basic front validation (syntaxe email simple)
    if (!email.includes("@")) {
      setEmailError("Adresse e‑mail invalide");
      return;
    }
    if (motDePasse.length < 1) {
      setPasswordError("Entrez votre mot de passe");
      return;
    }

    setLoading(true);

    // délai simulé (comme appel réseau)
    setTimeout(() => {
      // normalisation
      const normalizedEmail = email.trim().toLowerCase();

      // recherche user dans la "DB" de test
      const user = TEST_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!user) {
        // email introuvable
        setEmailError("Aucun compte trouvé avec cette adresse e‑mail");
        setLoading(false);
        return;
      }

      if (user.password !== motDePasse) {
        // mot de passe incorrect pour cet email
        setPasswordError("Mot de passe incorrect");
        setLoading(false);
        return;
      }

      // succès
      setSuccessMessage(`✅ Connexion réussie — bienvenue ${user.displayName ?? ""}`.trim());
      setEmail("");
      setMotDePasse("");
      setLoading(false);
    }, 800);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <Text style={styles.label}>Adresse e‑mail</Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: getBorderColor(emailFocus, emailError),
            backgroundColor: getBackgroundColor(emailFocus),
          },
        ]}
        placeholder="Entrez votre e‑mail"
        placeholderTextColor="#8B7765"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        onFocus={() => setEmailFocus(true)}
        onBlur={() => setEmailFocus(false)}
      />
      {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

      <Text style={styles.label}>Mot de passe</Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: getBorderColor(mdpFocus, passwordError),
            backgroundColor: getBackgroundColor(mdpFocus),
          },
        ]}
        placeholder="Entrez votre mot de passe"
        placeholderTextColor="#8B7765"
        secureTextEntry
        value={motDePasse}
        onChangeText={setMotDePasse}
        onFocus={() => setMdpFocus(true)}
        onBlur={() => setMdpFocus(false)}
      />
      {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}

      <TouchableOpacity
        disabled={isButtonDisabled}
        onPress={handleLogin}
        style={[
          styles.button,
          { backgroundColor: isButtonDisabled ? "#ccc" : "#8B6D5C" },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Se connecter</Text>
        )}
      </TouchableOpacity>

      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

      {/* Petit texte d'aide */}
      <View style={{ marginTop: 12 }}>
        <Text style={styles.hintText}>
          Astuce test : utilisez l'un des comptes de `users.ts` (ex. alice@example.com / Password123).
        </Text>
      </View>
    </View>
  );
};

export default ConnexionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#FDF6F0" },
  title: { fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 24, color: "#4B3F36" },
  label: { fontSize: 14, marginBottom: 6, color: "#4B3F36", fontWeight: "500" },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
    color: "#000",
    backgroundColor: "#FDF8F2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  error: { color: "#e74c3c", fontSize: 12, marginBottom: 12 },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  success: { color: "#27ae60", fontSize: 16, fontWeight: "500", marginTop: 16, textAlign: "center" },
  hintText: { color: "#8B6D5C", fontSize: 12 },
});
