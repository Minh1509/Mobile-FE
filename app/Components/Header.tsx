import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export const HeaderSearch = ({ title }: { onBack: () => void, title: string }) => (
    <View className="bg-white px-4 py-3 shadow-sm border-b border-gray-200">
        <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold flex-1">{title}</Text>
        </View>
    </View>
);


export const Header = ({ onBack, title, onEdit, onDelete }: {
    onBack: () => void,
    title: string,
    onEdit?: () => void,
    onDelete?: () => void
}) => (
    <View className="bg-white p-4 shadow flex-row justify-between items-center ">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={onBack} className="mr-4">
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold">{title}</Text>
        </View>
        <View className="flex-row space-x-4 gap-4">
            {onEdit && (
                <TouchableOpacity onPress={onEdit} className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center ">
                    <Ionicons name="create-outline" size={24} color="#000" />
                </TouchableOpacity>
            )}
            {onDelete && (
                <TouchableOpacity onPress={onDelete} className="bg-red-100 w-10 h-10 rounded-full items-center justify-center">
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            )}
        </View>
    </View>
)

export const HeaderEdit = ({ onBack, title, onSave }: { onBack: () => void, title: string, onSave: () => void }) => (
    <View className="bg-white p-4 shadow">
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
                <TouchableOpacity onPress={onBack} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">{title}</Text>
            </View>
            <TouchableOpacity onPress={onSave} className="px-4 py-2 bg-orange-500 rounded-lg">
                <Text className="text-white font-bold">Lưu</Text>
            </TouchableOpacity>
        </View>
    </View>
);