declare module '@react-native-picker/picker' {
  import { ViewStyle } from 'react-native';
  
  export interface PickerProps {
    selectedValue: string;
    onValueChange: (value: string) => void;
    style?: ViewStyle;
    children: React.ReactNode;
  }

  export interface PickerItemProps {
    label: string;
    value: string;
  }

  export class Picker extends React.Component<PickerProps> {}
  export class PickerItem extends React.Component<PickerItemProps> {}
} 