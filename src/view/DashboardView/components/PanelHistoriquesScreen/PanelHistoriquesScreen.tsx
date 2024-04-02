import React, { Children, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Dimensions, FlatList, Image, ImageBackground, Keyboard, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Base from '../../../../components/Base';
import tw from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardHeaderSimple } from '../../../../components/DashboardHeaderSimple';
import { account, baseUri, componentPaddingHeader, downloadFile, fetchUri, formatDate, getUser, toast, validatePassword, windowWidth } from '../../../../functions/functions';
import { ActivityLoading } from '../../../../components/ActivityLoading';
import { Icon } from '@rneui/base';
import { ModalValidationForm } from '../../../../components/ModalValidationForm';
import { CommonActions } from '@react-navigation/native';
import { CodeColor } from '../../../../assets/style';
import  { default as HeaderP } from '../../../../components/Header';
import { DataTable } from 'react-native-paper';
import { refreshHistoriqueCandidatures } from '../../../../feature/refresh.slice';
import { refreshColor } from '../../../../functions/helperFunction';
import { deleteUser } from '../../../../feature/user.slice';
import '../../../../data/i18n';

interface RenderItemProps {
    navigation: any,
    item: any,
    deleteProject: any
}
const RenderItem: React.FC<RenderItemProps> = ({ navigation, item, deleteProject }) => {
    const [wolo, setWolo] = useState(false);

    return (
        <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => navigation.navigate('DashboadPanelHistorique', {cdc: item})}
            style={[ tw`rounded-lg bg-gray-200 bg-slate-100 mb-3 p-3` ]}>
            <View style={[ tw`` ]}>
                <View style={[ tw`flex-row justify-between items-center` ]}>
                    <Text style={[ tw`text-black text-base` ]}>{item.nom}</Text>
                    { item.valide == 1 
                        ? <Text style={[ tw`font-bold text-lime-600` ]}>validé</Text>
                        : wolo ?
                            <ActivityIndicator size={20} color='#ff2222' />
                            : <Icon
                                type="ant-design"
                                onPress={() => {
                                    setWolo(true)
                                    deleteProject(item.slug)
                                }}
                                name='close'
                                color={'#ff2222'}
                                size={20} />
                    }
                </View>
                <Text style={[ tw`mt-2 text-black text-right` ]}>{ formatDate(item.dat) }</Text>
            </View>
        </TouchableOpacity>
    )
}

interface PanelHistoriquesScreenProps {
    navigation?: any,
    route?: any
}
const PanelHistoriquesScreen: React.FC<PanelHistoriquesScreenProps> = (props) => {
    const {navigation, route} = props

    const dispatch = useDispatch();

    const user = useSelector((state: any) => state.user.data);

    const refresh = useSelector((state: any) => state.refresh.historique_candidatures);

    const [candidatures, setCandidatures] = useState([]);

    const [refreshing, setRefreshing] = useState(false);

    const [endFetch, setEndFetch] = useState(false);

    const [visible, setVisible] = useState(false);

    const onHandleDel = (index: number) => {
        setVisible(true)
        const formData = new FormData()
        formData.append('js', null);
        formData.append('csrf', null);
        formData.append('delete-candidature', null);
        formData.append('token', user.slug);
        // @ts-ignore
        formData.append(`candidature`, candidatures[index].slug);
        fetch(fetchUri, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'content-type': 'multipart/form-data'
            }
        })
        .then(response => response.json())
        .then(json => {
            setVisible(false);
            if(json.success) {
                toast('success', 'Candidature supprimée avec succès.', 'Notification', true)
                const cands = Object.values(candidatures);
                cands.splice(index, 1);
                setCandidatures(cands);
            } else {
                const errors = json.errors
                console.log('Errors: ', errors);
                toast('error', errors.candidature)
            }
        })
        .catch(e => {
            setVisible(false)
            console.warn(e)
        })
    }

    // @ts-ignore
    const renderItem = ({item, index}) => {
        let statut = '';
        let badge = 'rgb(107, 114, 128)';
        if(item.valide == 0) {
            statut = 'en attente';
        } else if(item.valide == 1) {
            statut = 'validé';
            badge = 'rgb(21, 128, 61)';
        } else if(item.valide == -1) {
            statut = 'rejeté';
            badge = 'rgb(153, 27, 27)';
        } else if(item.valide == 10) {
            statut = 'évaluation en cours';
            badge = 'rgb(249, 115, 22)';
        }
        return (
            <TouchableOpacity
                activeOpacity={0.5}
                // onLongPress={() => console.log('Supprimer ?')}
                onPress={() => navigation.navigate('DashboadPanelHistorique', {cdc: item})}
                style={[ tw`rounded-lg bg-gray-200 bg-slate-100 mb-3 p-3` ]}>
                <View style={[ tw`` ]}>
                    <View style={tw`flex-row`}>
                        <View style={tw`flex-1 mr-2`}>
                            <Text style={[ tw`text-black text-base` ]}>{item.offre_candidature.intituler}</Text>
                            <Text style={[ tw`text-black text-xs italic`, {color: badge} ]}>{statut}</Text>
                        </View>
                        <Icon type="octicon" name="dot-fill" color={badge} />
                    </View>
                    <View style={tw`flex-row justify-between items-center mt-2`}>
                        <View style={tw`flex-row`}>
                            {(item.valide == 0 || item.valide == -1) && (
                                <Pressable onPress={() => onHandleDel(index)} style={tw`mr-3`}>
                                    <Icon type="ant-design" name="closecircle" color={CodeColor.code2} size={20} />
                                </Pressable>
                            )}
                            {(item.valide !== 1 || item.valide !== -10) && (
                                <Pressable onPress={() => navigation.navigate('DashboadPanelAddCandidature', {candidature: item})} style={tw`mr-3`}>
                                    <Icon type="ant-design" name="edit" color='rgb(37, 99, 235)' size={20} />
                                </Pressable>
                            )}
                            <Pressable onPress={() => downloadFile(`${baseUri}/assets/files/cv/${item.cv}`, 'CV')}>
                                <Icon type="material-icon" name="file-present" color='#000000' size={20} />
                            </Pressable>
                        </View>
                        <Text style={[ tw`text-black` ]}>{ formatDate(item.dat) }</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const getCandidatures = () => {
        const formData = new FormData()
        formData.append('js', null)
        formData.append('candidatures', null)
        formData.append('token', user.slug)
        fetch(fetchUri, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(json => {
            if(json.success) {
                setCandidatures(json.candidatures);
            } else {
                console.warn(json.errors)
            }
            setEndFetch(true);
            setRefreshing(false);
        })
        .catch(e => console.warn(e))
    }

    const onRefresh = () => {
        setRefreshing(true);
        getCandidatures();
    }

    const goHome = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    {name: 'Home'}
                ]
            })
        )
    }

    useEffect(() => {
        if(Object.keys(user).length == 0) {
            goHome();
        }
    }, [user])

    useEffect(() => {
        getCandidatures();
    }, [refresh])

    return (
        endFetch ? 
                <Base>
                    <ModalValidationForm showM={visible} />
                    <HeaderP
                        elevated={true}
                        backgroundColor={CodeColor.code1}
                        containerStyle={{ paddingTop: componentPaddingHeader }}
                        leftComponent={
                            <DashboardHeaderSimple navigation={ navigation } title={'Candidatures'} />
                        }
                    />
                    <View style={[ tw`flex-1`, { backgroundColor: '#ffffff' }]}>
                        <FlatList
                            refreshControl={
                                <RefreshControl
                                    colors={refreshColor}
                                    refreshing={refreshing} 
                                    onRefresh={onRefresh} />
                            }
                            ListEmptyComponent={
                                <Text style={tw`text-center text-gray-400 p-2`}>Aucune candidature disponible</Text>
                            }
                            contentContainerStyle={[ tw`pt-5 px-2` ]}
                            data={candidatures}
                            keyExtractor={(item, index) => index.toString()} 
                            renderItem={renderItem}
                            // horizontal={ false }
                            // showsHorizontalScrollIndicator={false}
                            // showsVerticalScrollIndicator={true}        
                        />
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('DashboadPanelAddCandidature', {candidature: null})} activeOpacity={.5} style={[tw`absolute bottom-2 right-2`]}>
                        <Icon type="ant-design" name="pluscircle" color={CodeColor.code1} size={40} />
                    </TouchableOpacity>
                </Base> : <ActivityLoading />
    )
}

const styles = StyleSheet.create({
    title: {
        textAlign: 'center',
        color: 'rgb(4,28,84)',
        fontSize: 25,
        fontWeight: '600',
        marginBottom: 18,
        fontFamily: 'serif'
    },
    paragraph: {
        color: 'rgb(4,28,84)',
        lineHeight: 20,
        textAlign: 'justify',
        fontFamily: 'sans-serif'
    }
})

export default PanelHistoriquesScreen;