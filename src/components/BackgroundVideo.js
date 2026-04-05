// No background video on main screens — only used on login/register
import React from 'react';
import { View } from 'react-native';

export default function BackgroundVideo({ children }) {
  return <View style={{ flex: 1 }}>{children}</View>;
}
