import 'lucide-react-native';
import { SvgProps } from 'react-native-svg';

declare module 'lucide-react-native' {
  export interface LucideProps extends SvgProps {
    size?: number | string;
    color?: string;
    style?: any;
    absoluteStrokeWidth?: boolean;
    strokeWidth?: number | string;
  }
}
