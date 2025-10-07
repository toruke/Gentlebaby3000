import { Text, StyleSheet, TextInput, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Link } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from "react";

export default function ChildProfile() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedGender, setSelectedGender] = useState("");

    // Validation des noms
    const validateName = (name: string): boolean => {
        if (!name || name.length < 2) return false;
        if (name.length > 20) return false;
        
        // Regex: seulement lettres, espaces, apostrophes et tirets
        const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
        if (!nameRegex.test(name)) return false;
        
        // Pas de nombres
        const numberRegex = /\d/;
        if (numberRegex.test(name)) return false;
        
        // Pas de caractères spéciaux excepté ceux autorisés
        const specialCharRegex = /[^a-zA-ZÀ-ÿ\s'-]/;
        if (specialCharRegex.test(name)) return false;
        
        return true;
    };

    const handleFirstNameChange = (text: string) => {
        setFirstName(text);
    };

    const handleLastNameChange = (text: string) => {
        setLastName(text);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setBirthDate(selectedDate);
        }
    };

    const showDatePickerModal = () => {
        setShowDatePicker(true);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleGenderSelect = (gender: string) => {
        setSelectedGender(gender);
    };

    const handleSubmit = () => {
        // Validation finale avant soumission
        if (!validateName(firstName)) {
            Alert.alert("Erreur", "Le prénom n'est pas valide. Utilisez seulement des lettres (2-20 caractères).");
            return;
        }

        if (!validateName(lastName)) {
            Alert.alert("Erreur", "Le nom n'est pas valide. Utilisez seulement des lettres (2-20 caractères).");
            return;
        }

        if (!selectedGender) {
            Alert.alert("Erreur", "Veuillez sélectionner un genre.");
            return;
        }

        // Calcul de l'âge
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 0 || age > 18) {
            Alert.alert("Erreur", "La date de naissance n'est pas valide. L'enfant doit avoir entre 0 et 18 ans.");
            return;
        }

        // Ici tu peux ajouter la logique pour sauvegarder le profil
        Alert.alert("Succès", "Profil de l'enfant créé avec succès !");
        
        // Réinitialiser le formulaire
        setFirstName("");
        setLastName("");
        setBirthDate(new Date());
        setSelectedGender("");
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Create Child Profile</Text>
                <Text style={styles.subtitle}>Add your child's information</Text>
            </View>

            {/* Formulaire */}
            <View style={styles.formContainer}>
                {/* Prénom de l'enfant */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Child's First Name *</Text>
                    <TextInput 
                        placeholder="Enter first name"
                        placeholderTextColor="#999"
                        style={[
                            styles.input,
                            firstName && !validateName(firstName) && styles.inputError
                        ]}
                        value={firstName}
                        onChangeText={handleFirstNameChange}
                        maxLength={50}
                    />
                    {firstName && !validateName(firstName) && (
                        <Text style={styles.errorText}>
                            Prénom invalide. Utilisez seulement des lettres (2-50 caractères).
                        </Text>
                    )}
                </View>

                {/* Nom de famille */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Child's Last Name *</Text>
                    <TextInput 
                        placeholder="Enter last name"
                        placeholderTextColor="#999"
                        style={[
                            styles.input,
                            lastName && !validateName(lastName) && styles.inputError
                        ]}
                        value={lastName}
                        onChangeText={handleLastNameChange}
                        maxLength={50}
                    />
                    {lastName && !validateName(lastName) && (
                        <Text style={styles.errorText}>
                            Nom invalide. Utilisez seulement des lettres (2-50 caractères).
                        </Text>
                    )}
                </View>

                {/* Date de naissance */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date of Birth *</Text>
                    <TouchableOpacity onPress={showDatePickerModal}>
                        <View style={styles.dateInput}>
                            <Text style={[
                                styles.dateText,
                                birthDate && styles.dateTextSelected
                            ]}>
                                {birthDate ? formatDate(birthDate) : "DD/MM/YYYY"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    
                    {showDatePicker && (
                        <DateTimePicker
                            value={birthDate}
                            mode="date"
                            display="spinner"
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                            minimumDate={new Date(2000, 0, 1)}
                        />
                    )}
                </View>

                {/* Genre */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Gender *</Text>
                    <View style={styles.genderContainer}>
                        <TouchableOpacity 
                            style={[
                                styles.genderButton,
                                selectedGender === "male" && styles.genderSelected
                            ]}
                            onPress={() => handleGenderSelect("male")}
                        >
                            <Text style={[
                                styles.genderText,
                                selectedGender === "male" && styles.genderTextSelected
                            ]}>
                                Male
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[
                                styles.genderButton,
                                selectedGender === "female" && styles.genderSelected
                            ]}
                            onPress={() => handleGenderSelect("female")}
                        >
                            <Text style={[
                                styles.genderText,
                                selectedGender === "female" && styles.genderTextSelected
                            ]}>
                                Female
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[
                                styles.genderButton,
                                selectedGender === "other" && styles.genderSelected
                            ]}
                            onPress={() => handleGenderSelect("other")}
                        >
                            <Text style={[
                                styles.genderText,
                                selectedGender === "other" && styles.genderTextSelected
                            ]}>
                                Other
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bouton de soumission */}
                <TouchableOpacity 
                    style={styles.createButton}
                    onPress={handleSubmit}
                >
                    <Text style={styles.createButtonText}>Create Profile</Text>
                </TouchableOpacity>

                {/* Lien retour */}
                <Link href="/" style={styles.cancelLink}>
                    <Text style={styles.cancelText}>Cancel</Text>
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
        backgroundColor: '#6b46c1',
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
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    inputError: {
        borderColor: '#e53e3e',
        backgroundColor: '#fed7d7',
    },
    errorText: {
        color: '#e53e3e',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    dateInput: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    dateText: {
        fontSize: 16,
        color: '#999',
    },
    dateTextSelected: {
        color: '#2d3748',
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
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    genderSelected: {
        backgroundColor: '#6b46c1',
        borderColor: '#6b46c1',
    },
    genderText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4a5568',
    },
    genderTextSelected: {
        color: '#ffffff',
    },
    createButton: {
        backgroundColor: '#6b46c1',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
        shadowColor: '#6b46c1',
        shadowOffset: { width: 0, height: 4 },
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