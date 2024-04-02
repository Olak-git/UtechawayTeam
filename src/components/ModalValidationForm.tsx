import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Modal } from 'react-native-form-component';
import { CodeColor } from '../assets/style';
import tw from 'twrnc';

interface ModalValidationFormProps {
    showM: boolean
}

export const ModalValidationForm: React.FC<ModalValidationFormProps> = (props) => {
    const { showM } = props;
    return (
        <Modal 
            show={showM}
            backgroundColor={'rgba(0,0,0,0.4)'}
            style={[]}>
            <View style={tw`flex-1 justify-center items-center`}>
                <ActivityIndicator
                    size='small'
                    color='#FFFFFF'
                    animating />
            </View>
        </Modal>
    )
}