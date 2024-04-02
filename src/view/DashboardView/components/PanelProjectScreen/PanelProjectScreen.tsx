import React, { Children, useEffect, useState } from 'react';
import { Alert, Button, Dimensions, FlatList, Image, ImageBackground, Keyboard, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Base from '../../../../components/Base';
import tw from 'twrnc';
import { Card, Header, Switch, Tab, TabView, ListItem, Avatar, Text as TextRNE, Divider } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardHeaderSimple } from '../../../../components/DashboardHeaderSimple';
import { account, baseUri, componentPaddingHeader, downloadFile, fetchUri, formatDate, getCurrency, getRandomInt, getUser, validatePassword } from '../../../../functions/functions';
import { ActivityLoading } from '../../../../components/ActivityLoading';
import { ModalValidationForm } from '../../../../components/ModalValidationForm';
import { DataTable } from 'react-native-paper';
import { default as HeaderP } from '../../../../components/Header';
import { CommonActions } from '@react-navigation/native';
import { CodeColor } from '../../../../assets/style';
import { refreshColor } from '../../../../functions/helperFunction';
import { deleteUser } from '../../../../feature/user.slice';
import '../../../../data/i18n';
import { useTranslation } from 'react-i18next';

interface ParamItemProps {
    title: string,
    description: string,
    hasDivider?: boolean,
}
const ParamItem: React.FC<ParamItemProps> = ({title, description, hasDivider}) => {
    return (
        <View style={tw`mb-3`}>
            <View style={tw`px-3`}>
                <Text style={[tw`text-base mb-1 text-black`, {fontFamily: 'YanoneKaffeesatz-Regular',}]}>{title}</Text>
                <Text style={tw`text-sm text-slate-500`}>{description}</Text>
            </View>
            {hasDivider && (
                <View style={tw`px-5 my-3`}><Divider color='#ffffff' /></View>
            )}
        </View>
    )
}

interface ParagraphProps {
    dTitle: string, 
    dText: string|number
}
const Paragraph: React.FC<ParagraphProps> = ({dTitle, dText}) => {
    return (
        <View style={[ tw`flex-row mb-5` ]}>
            <View style={[ {flex: 1} ]}><Text style={[ tw`text-base text-black` ]}>{ dTitle } : </Text></View>
            <View style={[ {flex: 2} ]}><Text style={[ tw`text-base text-gray-600` ]}>{ dText }</Text></View>
        </View>
    )
}

interface PanelProjectScreenProps {
    navigation?: any,
    route?: any
}

const PanelProjectScreen: React.FC<PanelProjectScreenProps> = (props) => {
    const { t } = useTranslation();
    
    const {navigation, route} = props

    const dispatch = useDispatch();

    // @ts-ignore
    const user = useSelector(state => state.user.data);

    const [data, setData] = useState({
        cdc: route.params.cdc,
        docs: [],
        facture: null,
        contrat: null
    });

    const [refreshing, setRefreshing] = useState(false);

    const [endFetch, setEndFetch] = useState(false)

    const getData = () => {
        const formData = new FormData()
        formData.append('js', null)
        formData.append(`data-project`, null)
        formData.append('key', route.params.cdc.slug)
        // @ts-ignore
        formData.append('token', user.slug)
        fetch(fetchUri, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(json => {
            if(json.success) {
                setData(state => ({...state, cdc: json.cdc, docs: json.docs, facture: json.facture, contrat: json.contrat}))
                // setCdc(json.cdc)
                setEndFetch(true)
            } else {
                console.warn(json.errors)
            }
            setRefreshing(false);
        })
        .catch(e => console.warn(e))
    }

    const onRefresh = () => {
        setRefreshing(true);
        getData();
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
            goHome()
        } else {
            getData();
        }
    }, [user])

    return (
        <Base>
            <HeaderP
                elevated={true}
                backgroundColor={CodeColor.code1}
                containerStyle={{ paddingTop: componentPaddingHeader }}
                leftComponent={
                    <DashboardHeaderSimple navigation={navigation} title={route.params.headerTitle ? route.params.headerTitle : 'Historique'} />
                }
            />
            {endFetch
                ?
                <>
                    <View style={[tw`flex-1`, { backgroundColor: '#ffffff' }]}>
                        <ScrollView
                            refreshControl={
                                <RefreshControl
                                    colors={refreshColor}
                                    refreshing={refreshing}
                                    onRefresh={onRefresh} />
                            }
                        >
                            <View style={[tw`py-4 px-3 text-base`]}>
                                <Paragraph
                                    dTitle='Nom du projet'
                                    dText={data.cdc.nom} />

                                <Paragraph
                                    dTitle='Délai'
                                    dText={data.cdc.nb_freq + ' ' + data.cdc.freq + '(s)'} />

                                <Paragraph
                                    dTitle='Description'
                                    dText={data.cdc.description} />

                                <Paragraph
                                    dTitle='Fonctionalité'
                                    dText={data.cdc.fonctionnalite} />

                                <Paragraph
                                    dTitle='Montant'
                                    // @ts-ignore
                                    dText={data.facture ? `${getCurrency(data.facture.mnt)} XOF` : '0.00'} />

                                {data.cdc.fichier_cdc_uploader && (
                                    <>
                                        <Divider style={[tw`mb-3`]} color={CodeColor.code1} />
                                        <DataTable style={[tw`mb-4`]}>
                                            <DataTable.Header style={[tw`bg-slate-200`]}>
                                                <DataTable.Title textStyle={[tw`font-extrabold`]}>Fichiers</DataTable.Title>
                                                <DataTable.Title textStyle={[tw`font-extrabold`]}>{null}</DataTable.Title>
                                            </DataTable.Header>
                                            <DataTable.Row key={getRandomInt(0, 20).toString()} style={[tw``]}>
                                                <DataTable.Cell>{data.cdc.nom_fichier_cdc_uploader}</DataTable.Cell>
                                                <DataTable.Cell
                                                    style={[tw`justify-center`]}>
                                                    <TouchableOpacity
                                                        style={[tw``]}
                                                        onPress={() => downloadFile(baseUri + '/assets/files/cdc/' + data.cdc.fichier_cdc_uploader, data.cdc.nom_fichier_cdc_uploader)}>
                                                        <Text style={[tw`text-cyan-500 text-center`]}>Télécharger</Text>
                                                    </TouchableOpacity>
                                                </DataTable.Cell>
                                            </DataTable.Row>
                                        </DataTable>
                                    </>
                                )}

                                {/* <Divider style={[ tw`mb-3` ]} color={CodeColor.code1} /> */}
                                <DataTable style={[tw`mb-8`]}>
                                    <DataTable.Header style={[tw`bg-slate-200`]}>
                                        <DataTable.Title textStyle={[tw`font-extrabold`]}>Autres Fichiers</DataTable.Title>
                                        <DataTable.Title textStyle={[tw`font-extrabold`]}>{null}</DataTable.Title>
                                    </DataTable.Header>
                                    {data.docs.length == 0
                                        ?
                                        <DataTable.Row style={[tw``]}>
                                            <DataTable.Cell>Aucun fichier</DataTable.Cell>
                                        </DataTable.Row>
                                        :
                                        data.docs.map((item, index) => (
                                            <DataTable.Row key={index.toString()} style={[tw``]}>
                                                {/* @ts-ignore */}
                                                <DataTable.Cell>{item.name_doc}</DataTable.Cell>
                                                <DataTable.Cell
                                                    style={[tw`justify-center`]}>
                                                    <TouchableOpacity
                                                        style={[tw``]}
                                                        // @ts-ignore
                                                        onPress={() => downloadFile(`${baseUri}/assets/files/cdc/${item.doc}`, item.name_doc)}>
                                                        <Text style={[tw`text-cyan-500 text-center`]}>Télécharger</Text>
                                                    </TouchableOpacity>
                                                </DataTable.Cell>
                                            </DataTable.Row>
                                        ))
                                    }
                                </DataTable>

                                {data.facture && (
                                    <TouchableOpacity
                                        activeOpacity={0.5}
                                        onPress={() => {
                                            navigation.navigate('DashboadFacture', { facture: data.facture })
                                        }}
                                        style={[tw`justify-center rounded-xl mb-4 border`, { borderColor: CodeColor.code1, height: 50 }]}>
                                        <Text style={[tw`text-center text-black`, { fontFamily: 'YanoneKaffeesatz-Regular' }]}>Mes paiements</Text>
                                    </TouchableOpacity>
                                )}

                                {data.contrat && (
                                    <TouchableOpacity
                                        activeOpacity={0.5}
                                        onPress={() => {
                                            console.log('Contrat non abouti')
                                            // navigation.navigate('DashboadClientContrat', {cdcSlug: data.cdc.slug})
                                        }}
                                        style={[tw`justify-center rounded-xl mb-4 border`, { borderColor: CodeColor.code1, height: 50 }]}>
                                        <Text style={[tw`text-center text-black`, { fontFamily: 'YanoneKaffeesatz-Regular' }]}>Contrat</Text>
                                    </TouchableOpacity>
                                )}

                            </View>
                        </ScrollView>
                    </View>
                </>
                : <ActivityLoading />
            }
        </Base> 
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

export default PanelProjectScreen;