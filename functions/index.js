const {onSchedule} = require("firebase-functions/v2/scheduler");
const {logger} = require("firebase-functions");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();

exports.cleanupInactiveGames = onSchedule("every 24 hours", async (event) => {
  logger.log("Running inactive game cleanup job.");

  const db = getFirestore();
  const now = Date.now();
  const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000);

  const inactiveQuery = db.collectionGroup("games")
      .where("lastActivity", "<", twoHoursAgo);

  try {
    const snapshot = await inactiveQuery.get();

    if (snapshot.empty) {
      logger.log("No inactive games to delete.");
      return;
    }

    const batch = db.batch();
    let deletedCount = 0;

    snapshot.forEach((doc) => {
      logger.log(`Deleting abandoned room: ${doc.id}`);
      batch.delete(doc.ref);
      deletedCount++;
    });

    await batch.commit();
    logger.log(`Successfully deleted ${deletedCount} inactive games.`);
  } catch (error) {
    logger.error("Error during game cleanup:", error);
  }
});
