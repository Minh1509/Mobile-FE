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
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 8,
    },
    summaryWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 8,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#333',
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    transactionList: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    categoryItem: {
        marginBottom: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    expandedContent: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    transactionIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    transactionDescription: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    chartToggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    chartToggleButton: {
        padding: 8,
        marginHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    chartToggleButtonActive: {
        backgroundColor: '#E0E0E0',
    },
});