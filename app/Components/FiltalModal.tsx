import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    categories: string[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    sortOptions: string[];
    selectedSort: string;
    setSelectedSort: (option: string) => void;
    onReset: () => void;
}

const FilterModal = ({
    visible,
    onClose,
    categories,
    selectedCategory,
    setSelectedCategory,
    sortOptions,
    selectedSort,
    setSelectedSort,
    onReset
}: FilterModalProps) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable
                className='flex-1 bg-black bg-opacity-50 justify-end'
                onPress={onClose}
            >
                <Pressable
                    className='bg-white rounded-t-3xl p-6'
                    onPress={(e) => e.stopPropagation()}
                >
                    <View className='items-center mb-4'>
                        <View className='w-12 h-1 bg-gray-300 rounded-full'></View>
                    </View>

                    <Text className='text-xl font-bold mb-4'>Bộ lọc</Text>

                    {/* Category filter */}
                    <Text className='text-lg font-medium mb-2'>Danh mục</Text>
                    <View className='flex-row flex-wrap mb-6'>
                        {categories.map(category => (
                            <TouchableOpacity
                                key={category}
                                className={`mr-2 mb-2 p-2 rounded-full border ${selectedCategory === category ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}
                                onPress={() => setSelectedCategory(category)}
                            >
                                <Text className={`${selectedCategory === category ? 'text-white' : 'text-gray-700'}`}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Sort options */}
                    <Text className='text-lg font-medium mb-2'>Sắp xếp</Text>
                    <View className='mb-6'>
                        {sortOptions.map(option => (
                            <TouchableOpacity
                                key={option}
                                className={`mb-2 p-3 rounded-lg ${selectedSort === option ? 'bg-blue-100' : 'bg-white'}`}
                                onPress={() => setSelectedSort(option)}
                            >
                                <View className='flex-row items-center'>
                                    <View className={`w-5 h-5 rounded-full border mr-3 items-center justify-center ${selectedSort === option ? 'border-blue-500' : 'border-gray-300'}`}>
                                        {selectedSort === option && (
                                            <View className='w-3 h-3 rounded-full bg-blue-500' />
                                        )}
                                    </View>
                                    <Text className='text-gray-700'>{option}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Action buttons */}
                    <View className='flex-row'>
                        <TouchableOpacity
                            className='flex-1 p-3 bg-gray-200 rounded-lg mr-2'
                            onPress={onReset}
                        >
                            <Text className='text-center font-medium'>Đặt lại</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className='flex-1 p-3 bg-green-500 rounded-lg'
                            onPress={onClose}
                        >
                            <Text className='text-white text-center font-medium'>Áp dụng</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default FilterModal;