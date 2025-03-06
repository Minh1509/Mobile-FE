import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        justifyContent: 'center',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 5,
    },
    subText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    genderButton: {
        flex: 1,
        height: 80,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        marginHorizontal: 5,
    },
    genderButtonSelected: {
        borderColor: '#FF3B30',
        backgroundColor: '#fff',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    genderIcon: {
        width: 40,
        height: 40,
        marginBottom: 5,
    },
    genderText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    signUpButton: {
        backgroundColor: '#FF3B30',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    signUpButtonDisabled: {
        backgroundColor: '#FF6B61',
        opacity: 0.7,
    },
    signUpButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
    },
    loginLink: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    // Thêm style cho input khi focus (tùy chọn)
    inputFocused: {
        borderColor: '#FF3B30',
        borderWidth: 2,
        backgroundColor: '#fff',
    },
    // Thêm style cho error (nếu cần)
    inputError: {
        borderColor: '#FF3B30',
        borderWidth: 1,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginBottom: 10,
        marginTop: -10,
    },
});