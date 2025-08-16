// functions/src/index.ts
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
admin.initializeApp();
const db = admin.firestore();

export const onRightSwipe = functions.firestore
  .document("swipes/{swipeId}")
  .onCreate(async (snap) => {
    const swipe = snap.data();
    if (swipe.direction !== "right" || swipe.targetType !== "user") return;

    const { swiperId, targetId } = swipe;

    // Has target already right-swiped swiper?
    const reciprocal = await db.collection("swipes")
      .where("swiperId", "==", targetId)
      .where("targetId", "==", swiperId)
      .where("targetType", "==", "user")
      .where("direction", "==", "right")
      .limit(1)
      .get();

    if (!reciprocal.empty) {
      // Create match if not exists
      const matchId = [swiperId, targetId].sort().join("_");
      const matchRef = db.collection("matches").doc(matchId);
      const exists = await matchRef.get();
      if (!exists.exists) {
        await matchRef.set({
          userA: swiperId,
          userB: targetId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastMessage: null
        });
        // Optional: send push notifications
      }
    }

    // Also record a "follow" relationship (user follows target user or pet)
    if (swipe.targetType === "user") {
      await db.collection("follows").add({
        followerId: swiperId,
        followingId: targetId,
        targetType: "user",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });
