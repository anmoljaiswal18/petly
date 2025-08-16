// App.tsx
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native";
import { CardStack } from "./components/CardStack";
import { PetCard } from "./components/PetCard";
import { fetchPets, Pet, writeSwipe } from "./lib/firestore";
import { haversineKm } from "./lib/geo";

const currentUserId = "demoUser123"; // replace with Firebase Auth uid

export default function App() {
  const [myLoc, setMyLoc] = useState<{lat:number; lon:number} | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [ownersById, setOwnersById] = useState<Record<string, {displayName: string}>>({}); // preload minimal owner info

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        setMyLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      }
      const items = await fetchPets();
      setPets(items);
      // TODO: fetch owners map for displaying owner names (left out for brevity)
    })();
  }, []);

  const sorted = useMemo(() => {
    if (!myLoc) return [];
    return pets
      .map(p => ({ ...p, distanceKm: haversineKm(myLoc, p.location) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .map((p, i) => ({ ...p, key: p.id })); // CardStack expects key
  }, [myLoc, pets]);

  const handleSwipe = async (item: any, dir: "left"|"right") => {
    const targetUser = item.ownerId; // follow owners for matching; and also follow pet profile if you want
    await writeSwipe({
      swiperId: currentUserId,
      targetId: targetUser,
      targetType: "user",
      direction: dir
    });
    if (dir === "right") {
      // Optionally, also create a "follow pet" doc immediately
      // await createFollow({ followerId: currentUserId, followingId: item.id, targetType: "pet" })
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {myLoc && (
        <CardStack
          data={sorted}
          renderItem={(p) => (
            <PetCard
              name={p.name}
              breed={p.breed}
              ownerName={ownersById[p.ownerId]?.displayName ?? "Owner"}
              distanceKm={p.distanceKm}
              photo={p.photos?.[0]}
            />
          )}
          onSwipe={handleSwipe}
        />
      )}
    </SafeAreaView>
  );
}
