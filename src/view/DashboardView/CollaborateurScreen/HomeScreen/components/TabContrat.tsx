import React, { useEffect, useState } from 'react';
import { View, Pressable, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { DataTable } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import tw from 'twrnc';
import { ActivityLoading } from '../../../../../components/ActivityLoading';
import { account, fetchUri, formatDate } from '../../../../../functions/functions';
import '../../../../../data/i18n';
import { useTranslation } from 'react-i18next';

interface TabContratProps {
    endFetch: boolean,
    contrats: any,
    refreshing: boolean,
    onRefresh: any,
    navigation: any,
    user: any,
}
export const TabContrat: React.FC<TabContratProps> = ({ endFetch, contrats, refreshing, onRefresh, navigation, user }) => {
    const { t } = useTranslation();
    
    // @ts-ignore
    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.5}
            onPress={ () => navigation.navigate('DashboadContrat', {item: item}) }
            style={[ tw`bg-sky-600 bg-gray-100 rounded-xl mb-4 p-3 ${item.signature ? 'border-green-700' : ''}`, {elevation: 5, shadowColor: 'gray', shadowOpacity: 0.5, shadowRadius: 5, shadowOffset: {width: 0, height: 5}, borderStartWidth: 8} ]}
        >
            <Text style={[ tw`font-extrabold text-black` ]}>{ item.cdc_nom }</Text>
            <View style={tw`flex-row`}>
                {(item.signature != null && item.signature != '') && (
                    <Text style={[ tw`mt-2 font-thin text-green-700` ]}>{t('dashboard_screen.signed')}</Text>
                )}
                <Text style={[ tw`mt-2 font-thin text-black`, {marginLeft: 'auto'} ]}>{ formatDate(item.dat) }</Text>
            </View>
        </TouchableOpacity>
    )

    useEffect(() => {
        // console.log('Contrats => ', Object.keys(contrats[0]))
    }, [])
    
    return (
        <FlatList
            ListEmptyComponent={
                endFetch
                    ?
                        <View style={tw`px-2`}>
                            <Text style={[tw`text-black text-center`]}>{t('dashboard_screen.no_contract_available')}</Text>
                        </View>
                    : <ActivityLoading containerStyle={tw`justify-start`} />
            }
            refreshControl={
                <RefreshControl
                    colors={['red', 'blue', 'green']}
                    refreshing={refreshing}
                    onRefresh={onRefresh} />
            }
            contentContainerStyle={[tw`pt-5 pb-50 px-2`]}
            data={contrats}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={true}
        />
    )
}