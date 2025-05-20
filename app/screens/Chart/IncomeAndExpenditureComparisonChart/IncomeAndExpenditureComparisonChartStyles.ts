import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        zIndex: 1, // Đảm bảo zIndex thấp hơn popup
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 8,
    },
    datePickerContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginTop: 8,
        zIndex: 2, // Đảm bảo zIndex thấp hơn popup
    },
    periodLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    datePickerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    datePickerWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    dateLabel: {
        fontSize: 14,
        color: '#333',
        marginRight: 8,
    },
    dateButton: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        flex: 1,
    },
    dateText: {
        fontSize: 14,
        color: '#333',
    },
    intervalPickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginTop: 8,
        zIndex: 1, // Đảm bảo zIndex thấp hơn popup
    },
    intervalButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    intervalButtonActive: {
        backgroundColor: '#E0E0E0',
    },
    intervalButtonText: {
        fontSize: 16,
        color: '#666',
    },
    intervalButtonTextActive: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    chartContainer: {
        backgroundColor: '#38576C', // Màu nền tối để phù hợp với biểu đồ
        borderRadius: 10,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 20,
        alignItems: 'center',
    },
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyzeButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        margin: 16,
        alignItems: 'center',
        zIndex: 1, // Đảm bảo zIndex thấp hơn popup
    },
    analyzeButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});