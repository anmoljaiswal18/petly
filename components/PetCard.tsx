// components/PetCard.tsx
import { Image } from "expo-image";
import { Text, View } from "react-native";

export function PetCard({
  name, breed, ownerName, distanceKm, photo
}: { name:string; breed:string; ownerName:string; distanceKm:number; photo?:string }) {
  return (
    <View className="w-full h-[72%] bg-white rounded-2xl shadow p-4 justify-between">
      <Image
        source={{ uri: photo }}
        style={{ width: "100%", height: "70%", borderRadius: 16 }}
        contentFit="cover"
      />
      <View>
        <Text className="text-xl font-semibold">{name} • {breed}</Text>
        <Text className="text-base text-gray-600">Owner: {ownerName}</Text>
        <Text className="text-base text-gray-600">{distanceKm.toFixed(1)} km away</Text>
      </View>
    </View>
  );
}
