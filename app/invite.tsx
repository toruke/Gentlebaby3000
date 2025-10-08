import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const InviteToGroupScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Données fictives d'utilisateurs
  const mockUsers = [
    {
      id: "1",
      name: "Marie Dubois",
      username: "@marie_d",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: "2",
      name: "Thomas Martin",
      username: "@thomas_m",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      id: "3",
      name: "Sophie Bernard",
      username: "@sophie_b",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    {
      id: "4",
      name: "Lucas Petit",
      username: "@lucas_p",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    {
      id: "5",
      name: "Emma Robert",
      username: "@emma_r",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    {
      id: "6",
      name: "Antoine Moreau",
      username: "@antoine_m",
      avatar: "https://i.pravatar.cc/150?img=6",
    },
    {
      id: "7",
      name: "Chloé Laurent",
      username: "@chloe_l",
      avatar: "https://i.pravatar.cc/150?img=7",
    },
    {
      id: "8",
      name: "Hugo Simon",
      username: "@hugo_s",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
  ];

  // Filtrer les utilisateurs selon la recherche
  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Gérer la sélection/désélection d'un utilisateur
  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Envoyer les invitations
  const handleSendInvitations = () => {
    if (selectedUsers.length === 0) {
      Alert.alert("Attention", "Veuillez sélectionner au moins un membre");
      return;
    }

    Alert.alert(
      "Invitations envoyées",
      `${selectedUsers.length} invitation(s) envoyée(s) avec succès!`,
      [{ text: "OK" }],
    );

    // Réinitialiser la sélection
    setSelectedUsers([]);
  };

  // Rendu d'un utilisateur
  const renderUserItem = ({ item }) => {
    const isSelected = selectedUsers.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.userCard, isSelected && styles.userCardSelected]}
        onPress={() => toggleUserSelection(item.id)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userUsername}>{item.username}</Text>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={18} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inviter des membres</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un utilisateur..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Compteur de sélection */}
      {selectedUsers.length > 0 && (
        <View style={styles.selectionBadge}>
          <Text style={styles.selectionText}>
            {selectedUsers.length} membre{selectedUsers.length > 1 ? "s" : ""}{" "}
            sélectionné{selectedUsers.length > 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {/* Liste des utilisateurs */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="person-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
          </View>
        }
      />

      {/* Bouton d'envoi */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            selectedUsers.length === 0 && styles.sendButtonDisabled,
          ]}
          onPress={handleSendInvitations}
          disabled={selectedUsers.length === 0}
        >
          <Ionicons
            name="send"
            size={20}
            color="#fff"
            style={styles.sendIcon}
          />
          <Text style={styles.sendButtonText}>
            Envoyer {selectedUsers.length > 0 && `(${selectedUsers.length})`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 34,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  selectionBadge: {
    backgroundColor: "#007AFF",
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userCardSelected: {
    backgroundColor: "#e3f2fd",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  userUsername: {
    fontSize: 14,
    color: "#666",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  sendButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default InviteToGroupScreen;
