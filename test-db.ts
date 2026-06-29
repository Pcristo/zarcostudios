import { listDocuments } from "./functions/_lib/firestore-rest";

async function run() {
  try {
    console.log("English subscribers:");
    const en = await listDocuments("subscribers");
    console.log(JSON.stringify(en, null, 2));

    console.log("Portuguese subscribers:");
    const pt = await listDocuments("pt_subscribers");
    console.log(JSON.stringify(pt, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
