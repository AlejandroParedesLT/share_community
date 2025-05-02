// import { Pressable, Text } from 'react-native';

// type ButtonProps = {
//   title: string;
//   onPress?: () => void;
// };

// export default function Button({ title, onPress }: ButtonProps) {
//   return (
//     <Pressable
//       onPress={onPress}
//       className="bg-blue-500 w-full p-3 items-center rounded-md"
//     >
//       <Text className="text-white font-semibold">{title}</Text>
//     </Pressable>
//   );
// }



import { Pressable, Text, View } from 'react-native';
import { useState } from 'react';

type ButtonProps = {
  title: string;
  onPress?: () => void;
};

export default function Button({ title, onPress }: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <View className="relative">
      {/* Shadow/base layer */}
      <View className="bg-gray-800 w-full p-3 rounded-md absolute top-1.5" />
      
      {/* Button face */}
      <Pressable
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        className={`
          bg-black w-full p-3 items-center rounded-md
          transition-all duration-100
        `}
        style={{
          transform: [{ translateY: isPressed ? 2 : 0 }]
        }}
        shadowOffset={isPressed ? undefined : { width: 0, height: 4 }}
        shadowOpacity={isPressed ? 0 : 0.3}
        shadowRadius={5}
        shadowColor="#000"
        elevation={isPressed ? 0 : 5}
      >
        {/* Inner highlight for 3D effect */}
        <View className="absolute inset-0 bg-gradient-to-b from-gray-700 to-transparent opacity-40 rounded-md overflow-hidden" />
        
        {/* Button text */}
        <Text className="text-white font-bold">{title}</Text>
        
        {/* Top edge highlight */}
        <View className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-gray-500 to-transparent opacity-30 rounded-t-md" />
      </Pressable>
    </View>
  );
}