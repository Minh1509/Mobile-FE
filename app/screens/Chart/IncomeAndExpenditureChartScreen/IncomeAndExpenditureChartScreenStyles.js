// File: IncomeAndExpenditureChartScreenStyles.js

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 20,
        marginHorizontal: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    tabWrapper: {
        marginHorizontal: 16,
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingVertical: 5,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    chartContainer: {
        backgroundColor: '#38576C',
        borderRadius: 10,
        padding: 16,
        marginHorizontal: 16,
        alignItems: 'center',
    },
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    dateText: {
        fontSize: 16,
        color: '#FFFFFF', // Đổi từ '#007AFF' thành '#FFFFFF' (màu trắng)
        marginHorizontal: 10,
    },
    chartToggleWrapper: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginTop: 10,
    },
    chartToggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    toggleButton: {
        padding: 10,
        borderRadius: 20,
        marginHorizontal: 5,
    },
    activeToggleButton: {
        backgroundColor: '#E0F7FA',
    },
    summaryWrapper: {
        marginHorizontal: 16,
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 16,
        marginVertical: 20,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
        padding: 10,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    transactionList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    transactionDescription: {
        fontSize: 16,
        color: '#333',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default styles;