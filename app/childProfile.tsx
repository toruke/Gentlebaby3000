import { Text, StyleSheet, TextInput, View, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";

export default function ChildProfile() {
    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Profile Enfant Création</Text>
                <Text style={styles.subtitle}>Compléter les information</Text>
            </View>

            {/* Formulaire */}
            <View style={styles.formContainer}>
                {/* Nom de l'enfant */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Prénom de l'enfant</Text>
                    <TextInput 
                        placeholder="Entrez le prénom"
                        placeholderTextColor="#999"
                        style={styles.input}
                    />
                </View>

                {/* Nom de famille */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nom de l'enfant</Text>
                    <TextInput 
                        placeholder="Entrez le nom de famille"
                        placeholderTextColor="#999"
                        style={styles.input}
                    />
                </View>

                {/* Date de naissance */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date de naissance</Text>
                    <TextInput 
                        placeholder="dd/mm/yyyy"
                        placeholderTextColor="#999"
                        style={styles.input}
                        keyboardType="numbers-and-punctuation"
                    />
                </View>

                {/* Genre */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Genre</Text>
                    <View style={styles.genderContainer}>
                        <TouchableOpacity style={[styles.genderButton, styles.genderSelected]}>
                            <Text style={styles.genderText}>Garçon</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.genderButton}>
                            <Text style={styles.genderText}>Fille</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.genderButton}>
                            <Text style={styles.genderText}>Autre</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bouton de soumission */}
                <TouchableOpacity style={styles.createButton}>
                    <Text style={styles.createButtonText}>Créer Profile</Text>
                </TouchableOpacity>

                {/* Lien retour */}
                <Link href="/" style={styles.cancelLink}>
                    <Text style={styles.cancelText}>Annuler</Text>
                </Link>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#6b46c1', // Violet du thème
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 30,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#e2e8f0',
        opacity: 0.9,
    },
    formContainer: {
        padding: 24,
        marginTop: -20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#2d3748',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    genderButton: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginHorizontal: 4,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    genderSelected: {
        backgroundColor: '#6b46c1',
        borderColor: '#6b46c1',
        color: '#ffffffff'

    },
    genderText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e2126ff',
    },
    createButton: {
        backgroundColor: '#6b46c1',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
        shadowColor: '#6b46c1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    createButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    cancelLink: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    cancelText: {
        color: '#6b46c1',
        fontSize: 16,
        fontWeight: '500',
    },
});