// users/{userId}
{
  displayName: string,
  photoURL: string,
  bio: string,
  location: { lat: number, lon: number }, // updated periodically
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// pets/{petId}
{
  ownerId: string, // users/{userId}
  name: string,
  breed: string,
  ageMonths: number,
  about: string,
  photos: string[], // storage URLs
  location: { lat: number, lon: number }, // from owner or pet's last known
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// swipes/{swipeId} (or subcollection users/{uid}/swipes)
{
  swiperId: string,     // who swiped (userId)
  targetId: string,     // pet owner userId OR petId (choose one model; see note below)
  targetType: "user"|"pet",
  direction: "right"|"left",  // right = follow request, left = reject
  createdAt: Timestamp
}

// follows/{followId}
{
  followerId: string,   // user who swiped right
  followingId: string,  // target user (owner) or pet (if following pets directly)
  targetType: "user"|"pet",
  createdAt: Timestamp
}

// matches/{matchId}
{
  userA: string,        // userId
  userB: string,        // userId
  createdAt: Timestamp,
  lastMessage: string | null
}

// matches/{matchId}/messages/{messageId}
{
  senderId: string,
  text: string,
  createdAt: Timestamp
}
