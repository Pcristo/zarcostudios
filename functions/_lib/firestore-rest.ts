import firebaseConfig from "../../firebase-applet-config.json";

const projectId = firebaseConfig.projectId;
const databaseId = firebaseConfig.firestoreDatabaseId;
const apiKey = firebaseConfig.apiKey;

function toFirestoreValue(val: any): any {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (typeof val === "boolean") {
    return { booleanValue: val };
  }
  if (typeof val === "number") {
    if (Number.isInteger(val)) {
      return { integerValue: String(val) };
    }
    return { doubleValue: val };
  }
  if (typeof val === "string") {
    return { stringValue: val };
  }
  if (val instanceof Date) {
    return { timestampValue: val.toISOString() };
  }
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(toFirestoreValue)
      }
    };
  }
  if (typeof val === "object") {
    return {
      mapValue: {
        fields: toFirestoreFields(val)
      }
    };
  }
  return { stringValue: String(val) };
}

function toFirestoreFields(obj: any): any {
  const fields: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      fields[key] = toFirestoreValue(val);
    }
  }
  return fields;
}

function fromFirestoreValue(value: any): any {
  if (!value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return parseInt(value.integerValue, 10);
  if ("doubleValue" in value) return parseFloat(value.doubleValue);
  if ("timestampValue" in value) return new Date(value.timestampValue);
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) {
    const vals = value.arrayValue.values || [];
    return vals.map(fromFirestoreValue);
  }
  if ("mapValue" in value) {
    const fields = value.mapValue.fields || {};
    return fromFirestoreFields(fields);
  }
  return null;
}

function fromFirestoreFields(fields: any): any {
  const obj: any = {};
  if (!fields) return obj;
  for (const [key, value] of Object.entries(fields)) {
    obj[key] = fromFirestoreValue(value);
  }
  return obj;
}

export async function getDocument(collectionName: string, docId: string) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${encodeURIComponent(docId)}?key=${apiKey}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firestore get error: ${res.status} ${errText}`);
  }
  const d = await res.json();
  return {
    id: docId,
    ...fromFirestoreFields(d.fields)
  };
}

export async function setDocument(collectionName: string, docId: string, data: any, merge = false) {
  let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${encodeURIComponent(docId)}?key=${apiKey}`;
  if (merge) {
    const keys = Object.keys(data);
    if (keys.length > 0) {
      const maskParams = keys.map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
      url += `&${maskParams}`;
    }
  }
  
  const fields = toFirestoreFields(data);
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields })
  });
  
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firestore set error: ${res.status} ${errText}`);
  }
  
  const d = await res.json();
  return {
    id: docId,
    ...fromFirestoreFields(d.fields)
  };
}

export async function listDocuments(collectionName: string) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}?key=${apiKey}`;
  const res = await fetch(url);
  if (res.status === 404) return [];
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firestore list error: ${res.status} ${errText}`);
  }
  const data = await res.json();
  const docs = data.documents || [];
  return docs.map((d: any) => {
    const parts = d.name.split("/");
    const id = parts[parts.length - 1];
    return {
      id,
      ...fromFirestoreFields(d.fields)
    };
  });
}
