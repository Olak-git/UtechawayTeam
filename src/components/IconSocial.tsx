import { Icon } from '@rneui/themed';
import React from 'react';

interface IconSocialProps {
    iconName: string,
    iconColor: string,
    onPress?: any,
    iconSize?: number
    iconType?: string
}

const IconSocial: React.FC<IconSocialProps> = ({iconName, iconColor, iconSize = 20, iconType = 'font-awesome', ...props}) => {

    return (
        <Icon
            reverse
            raised
            solid
            name={iconName}
            type={iconType}
            size={iconSize}
            color={iconColor}
            {...props}
        />
    )
}

export default IconSocial;