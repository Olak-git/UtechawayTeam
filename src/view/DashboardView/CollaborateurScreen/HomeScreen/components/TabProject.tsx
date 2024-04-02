import { ListItem } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { View, Pressable, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import tw from 'twrnc';
import { CodeColor } from '../../../../../assets/style';
import { ActivityLoading } from '../../../../../components/ActivityLoading';
import { account, fetchUri, formatDate } from '../../../../../functions/functions';
import { refreshColor } from '../../../../../functions/helperFunction';
import '../../../../../data/i18n';
import { useTranslation } from 'react-i18next';

interface TabProjectProps {
    endFetch: boolean,
    projets: any,
    refreshing: boolean,
    onRefresh: any,
    navigation: any
}
export const TabProject: React.FC<TabProjectProps> = ({ endFetch, projets, refreshing, onRefresh, navigation, ...props }) => {
    const { t } = useTranslation();

    // @ts-ignore
    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => navigation.navigate('DashboadCdc', {item: item, headerTitle: t('project_screen.project')})}
            style={[ tw`bg-gray-100 rounded-lg mb-4 p-3`, {} ]}
        >
            <View style={tw`flex-row justify-between mb-2`}>
                <Text style={[ tw`font-extrabold text-black flex-1 pr-2` ]}>{item.nom}</Text>
                <Text style={[ tw`font-thin text-black` ]}>{formatDate(item.dat)}</Text>
            </View>
            <View style={tw`flex-row flex-wrap justify-between`}>
                <Text style={tw`text-black`}><Text style={[ tw`font-semibold pr-2` ]}>{t('dashboard_screen.start_date')}: </Text>{formatDate(item.date_demarrage)}</Text>
                <Text style={tw`text-black`}><Text style={[ tw`font-semibold pr-2` ]}>{t('dashboard_screen.end_date')}: </Text>{formatDate(item.date_fin)}</Text>
            </View>
            
        </TouchableOpacity>
    )

    return (
        <FlatList
            refreshControl={
                <RefreshControl
                    colors={refreshColor}
                    refreshing={refreshing} 
                    onRefresh={onRefresh} />
            }
            contentContainerStyle={[ tw`pt-5 pb-50 px-2` ]}
            data={projets}
            ListEmptyComponent={
                endFetch
                ?
                    <View style={[ tw`px-2` ]}>
                        <Text style={[ tw`text-black text-center` ]}>{t('dashboard_screen.no_projects_yet')}</Text>
                    </View>
                : <ActivityLoading containerStyle={tw`justify-start`} />
            }
            keyExtractor={(item, index) => index.toString()} 
            renderItem={renderItem}
            horizontal={ false }
            showsHorizontalScrollIndicator={ false }
            showsVerticalScrollIndicator={ true }
        />
    )
}