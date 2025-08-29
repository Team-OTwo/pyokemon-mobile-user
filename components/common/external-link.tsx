import React from 'react';
import { Linking, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ExternalLinkProps extends TouchableOpacityProps {
  href: string;
  children: React.ReactNode;
}

export default function ExternalLink({ href, children, onPress, ...props }: ExternalLinkProps) {
  const handlePress = async (event: any) => {
    try {
      await Linking.openURL(href);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
    onPress?.(event);
  };

  return (
    <TouchableOpacity onPress={handlePress} {...props}>
      {children}
    </TouchableOpacity>
  );
}
