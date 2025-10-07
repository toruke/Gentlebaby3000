import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

const InscriptionTuteurScreen: React.FC = () => {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [prenomFocus, setPrenomFocus] = useState(false);
  const [nomFocus, setNomFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [mdpFocus, setMdpFocus] = useState(false);

  // Validation temps réel
  useEffect(() => {
    setEmailError(email && !email.includes("@") ? "Adresse e-mail invalide" : "");
  }, [email]);

  useEffect(() => {
    const errors = [];
    if (motDePasse.length > 0 && motDePasse.length < 8) errors.push("8 caractères");
    if (motDePasse && !/[A-Z]/.test(motDePasse)) errors.push("une majuscule");
    if (motDePasse && !/[a-z]/.test(motDePasse)) errors.push("une minuscule");
    if (motDePasse && !/\d/.test(motDePasse)) errors.push("un chiffre");
    setPasswordError(errors.length > 0 ? `Mot de passe invalide : ${errors.join(", ")}` : "");
  }, [motDePasse]);

  const isFormValid =
    prenom && nom && email && motDePasse && !emailError && !passwordError;

  const handleSubmit = () => {
    if (!isFormValid) return;
    setSuccessMessage(`✅ Compte créé avec succès pour ${prenom} ${nom} !`);
    setPrenom("");
    setNom("");
    setEmail("");
    setMotDePasse("");
  };

  // Couleur dynamique des champs
  const getBorderColor = (focus: boolean, error: string) => {
    if (error) return "#e74c3c"; // rouge vif
    if (focus) return "#8B6D5C"; // brun doux au focus
    return "#D8CFC4"; // beige clair par défaut
  };

  const getBackgroundColor = (focus: boolean) => {
    if (focus) return "#F5EDE0"; // ivoire clair au focus
    return "#FDF8F2"; // blanc cassé
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription du Tuteur</Text>

      {/* Prénom / Nom côte à côte */}
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Prénom</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: getBorderColor(prenomFocus, ""),
                backgroundColor: getBackgroundColor(prenomFocus),
              },
            ]}
            placeholder="Prénom"
            placeholderTextColor="#8B7765"
            value={prenom}
            onChangeText={setPrenom}
            onFocus={() => setPrenomFocus(true)}
            onBlur={() => setPrenomFocus(false)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: getBorderColor(nomFocus, ""),
                backgroundColor: getBackgroundColor(nomFocus),
              },
            ]}
            placeholder="Nom"
            placeholderTextColor="#8B7765"
            value={nom}
            onChangeText={setNom}
            onFocus={() => setNomFocus(true)}
            onBlur={() => setNomFocus(false)}
          />
        </View>
      </View>

      {/* Email */}
      <Text style={styles.label}>Adresse e-mail</Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: getBorderColor(emailFocus, emailError),
            backgroundColor: getBackgroundColor(emailFocus),
          },
        ]}
        placeholder="Entrez votre e-mail"
        placeholderTextColor="#8B7765"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        onFocus={() => setEmailFocus(true)}
        onBlur={() => setEmailFocus(false)}
      />
      {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

      {/* Mot de passe */}
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

      {/* Bouton */}
      <TouchableOpacity
        disabled={!isFormValid}
        onPress={handleSubmit}
        style={[
          styles.button,
          { backgroundColor: isFormValid ? "#8B6D5C" : "#ccc" },
        ]}
      >
        <Text style={styles.buttonText}>Créer mon compte</Text>
      </TouchableOpacity>

      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
    </View>
  );
};

export default InscriptionTuteurScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FDF6F0", // fond doux ivoire
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    color: "#4B3F36", // brun doux
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#4B3F36",
    fontWeight: "500",
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
    color: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  error: {
    color: "#e74c3c",
    fontSize: 12,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  success: {
    color: "#27ae60",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
    textAlign: "center",
  },
});
