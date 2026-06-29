import { getDocument, setDocument } from "./functions/_lib/firestore-rest";

async function run() {
  try {
    const testEmail = "test-" + Date.now() + "@example.com";
    console.log("Setting test document:", testEmail);
    const setRes = await setDocument("subscribers", testEmail, {
      email: testEmail,
      lang: "en",
      active: true,
      subscribedAt: new Date()
    });
    console.log("Set document result:", JSON.stringify(setRes, null, 2));

    console.log("Getting test document:");
    const getRes = await getDocument("subscribers", testEmail);
    console.log("Get document result:", JSON.stringify(getRes, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
