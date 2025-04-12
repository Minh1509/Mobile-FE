import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    FlatList,
    Platform,
    StyleSheet,
    Alert,
    Image,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import ExpenseComponent from "@/app/Components/ExpenseComponent";
import * as ImagePicker from 'expo-image-picker';
import ExpenseComponentV2 from "@/app/Components/ExpenseComponentV2";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "@/app/Types/types";
import { ITransaction } from "@/app/interface/Transaction";
import { TransactionService } from '@/app/services/transaction.service'; // Import TransactionService
import { PayMethod } from "@/app/interface/Transaction";
import { serverTimestamp } from "firebase/firestore";

type EditTransactionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditTransaction'>;
type EditTransactionScreenRouteProp = RouteProp<RootStackParamList, 'EditTransaction'>;

const EditTransactionScreen = () => {
    const navigation = useNavigation<EditTransactionScreenNavigationProp>();
    const route = useRoute<EditTransactionScreenRouteProp>();
    const { transaction, origin } = route.params;

    const paymentMethods = ["cash", "card", "bank_transfer"];
    // Form state
    const [money, setMoney] = useState(transaction?.amount ? String(transaction.amount) : "");
    const [note, setNote] = useState(transaction?.note || "");
    const [category, setCategory] = useState(transaction?.category || "Chọn loại");
    const [location, setLocation] = useState(transaction?.location || "");
    const [date, setDate] = useState(() => {
        if (transaction?.date && transaction?.time) {
            const [day, month, year] = transaction.date.split('/').map(Number);
            const [hour, minute] = transaction.time.split(':').map(Number);
            const newDate = new Date(year, month - 1, day);
            newDate.setHours(hour, minute);
            return newDate;
        }
        return new Date();
    });
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showDetails, setShowDetails] = useState(true);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
    const [description, setDescription] = useState(transaction?.description || "");
    const [paymentMethod, setPaymentMethod] = useState(transaction?.paymentMethod || "");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(transaction?.image || null);

    const categories = ["Ăn uống", "Mua sắm", "Di chuyển", "Tiền điện", "Tiền nước", "Học tập", "Giải trí", "Thuê nhà", "Internet", "Khác"];

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowPicker(false);
        if (event.type === "set" && selectedDate) {
            setDate(selectedDate);
        }
    };

    const onChangeTime = (event: DateTimePickerEvent, selectedTime?: Date) => {
        setShowPicker(false);
        if (event.type === "set" && selectedTime) {
            const newDate = new Date(date);
            newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
            setDate(newDate);
        }
    };

    const showDatePicker = () => {
        setPickerMode("date");
        setShowPicker(true);
    };

    const showTimePicker = () => {
        setPickerMode("time");
        setShowPicker(true);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== "granted") {
            Alert.alert("Cần quyền truy cập", "Bạn cần cấp quyền để sử dụng camera");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleMoneyChange = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, "");
        if (numericValue) {
            setMoney(numericValue);
        } else {
            setMoney("");
        }
    };

    const mapStringToPayMethod = (method: string): PayMethod => {
        switch (method) {
            case "Tiền mặt":
                return PayMethod.CASH;
            case "Thẻ tín dụng":
                return PayMethod.CARD;
            case "Ví điện tử":
                return PayMethod.BANK_TRANSFER;
            default:
                throw new Error(`Phương thức thanh toán không hợp lệ: ${method}`);
        }
    };

    const handleSave = async () => {
        const numericAmount = parseInt(String(money).replace(/[^\d]/g, ""));
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      
        if (!numericAmount || !category || category === "Chọn loại") {
          Alert.alert("Thiếu thông tin", "Vui lòng nhập số tiền và chọn danh mục");
          return;
        }
      
        const updatedTransaction: Partial<ITransaction> = {
          amount: numericAmount,
          date: formattedDate,
          time: formattedTime,
          category,
          description,
          location,
          paymentMethod,
          note,
          image: imageUri || "",
          updatedAt: serverTimestamp(),
        };
      
        try {
          const result = await TransactionService.updateTransaction(transaction.id, updatedTransaction);
          if (result.success) {
            const fullTransaction: ITransaction = {
              ...transaction,
              ...updatedTransaction,
              id: transaction.id,
              userId: transaction.userId,
              type: transaction.type,
            };
            Alert.alert("Thành công", "Giao dịch đã được cập nhật.", [
              {
                text: "OK",
                onPress: () => {
                    if (origin === 'Search') {
                        navigation.reset({
                          index: 1,
                          routes: [
                            { name: 'Tabs', state: {routes: [{ name: 'Search'}]}},
                            {
                              name: 'TransactionDetail',
                              params: { transaction: fullTransaction, origin: 'Search' },
                            },
                          ],
                        });
                      } else if (origin === 'Calendar') {
                        navigation.reset({
                          index: 2,
                          routes: [
                            { name: 'Tabs', state: { routes: [{ name: 'Calendar' }] } },
                            {
                              name: 'CategoryTransactions',
                              params: {
                                category: fullTransaction.category,
                                month: date.getMonth() + 1,
                                year: date.getFullYear(),
                                selectedDate: fullTransaction.date.split('/').reverse().join('-'),
                                origin: 'Calendar',
                              },
                            },
                            {
                              name: 'TransactionDetail',
                              params: { transaction: fullTransaction, origin: 'Calendar' },
                            },
                          ],
                        });
                      } else {
                        navigation.reset({
                          index: 2,
                          routes: [
                            { name: 'Tabs' },
                            {
                              name: 'CategoryTransactions',
                              params: {
                                category: fullTransaction.category,
                                month: date.getMonth() + 1,
                                year: date.getFullYear(),
                              },
                            },
                            {
                              name: 'TransactionDetail',
                              params: { transaction: fullTransaction, origin: 'Home' },
                            },
                          ],
                        });
                      }
                },
              },
            ]);
          } else {
            Alert.alert("Lỗi", result.error || "Không thể cập nhật giao dịch. Vui lòng thử lại.");
          }
        } catch (error: any) {
          console.error("Lỗi khi cập nhật giao dịch:", error);
          Alert.alert("Lỗi", "Không thể cập nhật giao dịch. Vui lòng thử lại.");
        }
      };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={navigation.goBack}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>
                        {transaction ? "Chỉnh sửa giao dịch" : "Thêm giao dịch mới"}
                    </Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Text style={styles.saveText}>Lưu</Text>
                    </TouchableOpacity>
                </View>

                {/* Input số tiền */}
                <TextInput
                    style={styles.input}
                    placeholder="Nhập số tiền"
                    keyboardType="numeric"
                    value={money}
                    onChangeText={handleMoneyChange}
                />

                {showDetails && (
                    <>
                        {/* Các mục chi tiêu */}
                        <View style={styles.card}>
                            <ExpenseComponent
                                icon="help-circle-outline"
                                text={category}
                                onPress={() => setShowCategoryModal(true)}
                            />
                            <TextInput
                                style={styles.inputDescription}
                                placeholder="Nhập mô tả"
                                value={description}
                                onChangeText={setDescription}
                            />
                            <TextInput
                                style={styles.inputDescription}
                                placeholder="Nhập địa điểm"
                                value={location}
                                onChangeText={setLocation}
                            />
                            <ExpenseComponent
                                icon="credit-card"
                                text={paymentMethod || "Chọn phương thức thanh toán"}
                                onPress={() => setShowPaymentModal(true)}
                            />
                            <ExpenseComponent
                                icon="calendar"
                                text={date.toLocaleDateString()}
                                onPress={showDatePicker}
                            />
                            <ExpenseComponent
                                icon="clock-outline"
                                text={date.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                })}
                                onPress={showTimePicker}
                            />
                            <ExpenseComponent
                                icon="pencil"
                                text={note || "Ghi Chú"}
                                onPress={() => {}}
                            />
                        </View>

                        {/* Input ghi chú */}
                        <TextInput
                            style={styles.noteInput}
                            placeholder="Nhập ghi chú"
                            value={note}
                            onChangeText={setNote}
                            multiline
                        />

                        <View style={styles.imageContainer}>
                            {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
                            <View style={styles.imageButtonContainer}>
                                <ExpenseComponentV2 icon="image" text="Chọn ảnh" onPress={pickImage} />
                                <View style={styles.divider} />
                                <ExpenseComponentV2 icon="camera" text="Chụp ảnh" onPress={takePhoto} />
                            </View>
                        </View>
                    </>
                )}

                {/* Nút ẩn/hiện chi tiết */}
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setShowDetails(!showDetails)}
                >
                    <Text style={styles.toggleButtonText}>
                        {showDetails ? "Ẩn bớt" : "Hiển thêm"}
                    </Text>
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        value={date}
                        mode={pickerMode}
                        display={Platform.OS === "ios" ? "inline" : "default"}
                        onChange={pickerMode === "date" ? onChangeDate : onChangeTime}
                    />
                )}

                {/* Modal Chọn Loại Chi Tiêu */}
                <Modal
                    visible={showCategoryModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowCategoryModal(false)}
                >
                    <View style={styles.overlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Chọn loại chi tiêu</Text>
                            <FlatList
                                data={categories}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.listItem}
                                        onPress={() => {
                                            setCategory(item);
                                            setShowCategoryModal(false);
                                        }}
                                    >
                                        <Text>{String(item)}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </Modal>

                {/* Modal Chọn Phương Thức Thanh Toán */}
                <Modal
                    visible={showPaymentModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowPaymentModal(false)}
                >
                    <View style={styles.overlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>
                            <FlatList
                                data={["Tiền mặt", "Thẻ tín dụng", "Ví điện tử"]}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.listItem}
                                        onPress={() => {
                                            const payMethod = mapStringToPayMethod(item);
                                            setPaymentMethod(payMethod);
                                            setShowPaymentModal(false);
                                        }}
                                    >
                                        <Text>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f3f4f6"
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 16
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold"
    },
    saveText: {
        color: "#1E90FF",
        fontWeight: "bold",
        fontSize: 20,
    },
    input: {
        backgroundColor: "#fff",
        padding: 16,
        fontSize: 18,
        borderRadius: 8,
        marginBottom: 12
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12
    },
    noteInput: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        marginVertical: 12,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: "top"
    },
    toggleButton: {
        backgroundColor: "#1E90FF",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8
    },
    toggleButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        maxHeight: '70%'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    listItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    inputDescription: {
        backgroundColor: "#f8f9fa",
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        color: "#333",
        marginVertical: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    imageContainer: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12
    },
    previewImage: {
        width: "100%",
        height: 240,
        borderRadius: 8,
        marginBottom: 12,
        marginTop: 8
    },
    imageButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center"
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: "#ccc"
    }
});

export default EditTransactionScreen;