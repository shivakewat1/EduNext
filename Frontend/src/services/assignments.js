import {
  collection, addDoc, getDocs, getDoc, setDoc, doc,
  query, where, serverTimestamp, updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

// ── Assignments ───────────────────────────────────────────────────────────────

export async function createAssignment(data) {
  const ref = await addDoc(collection(db, "assignments"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...data };
}

export async function getAllAssignments() {
  const snap = await getDocs(collection(db, "assignments"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAssignmentsForStudent(studentEmail) {
  const q = query(
    collection(db, "assignments"),
    where("assignedTo", "array-contains", studentEmail)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Submissions ───────────────────────────────────────────────────────────────

// submission doc id = assignmentId_studentEmail (unique per student per assignment)
export async function submitAssignment(assignmentId, studentEmail, submissionData, file = null) {
  const docId = `${assignmentId}_${studentEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;

  let finalData = { ...submissionData };

  // If actual File object provided, upload to Firebase Storage
  if (file && submissionData.type === "file") {
    const storageRef = ref(storage, `submissions/${assignmentId}/${studentEmail}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    finalData = {
      type: "file",
      name: file.name,
      size: file.size,
      fileType: file.type,
      url: downloadURL,
    };
  }

  await setDoc(doc(db, "submissions", docId), {
    assignmentId,
    studentEmail,
    ...finalData,
    submittedAt: serverTimestamp(),
  });
  return { id: docId, assignmentId, studentEmail, ...finalData };
}

export async function getAllSubmissions() {
  const snap = await getDocs(collection(db, "submissions"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getSubmissionsByStudent(studentEmail) {
  const q = query(
    collection(db, "submissions"),
    where("studentEmail", "==", studentEmail)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Marks ─────────────────────────────────────────────────────────────────────

// marks doc id = assignmentId_studentEmail
export async function saveMark(assignmentId, studentEmail, marks, maxMarks) {
  const docId = `${assignmentId}_${studentEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
  await setDoc(doc(db, "marks", docId), {
    assignmentId,
    studentEmail,
    marks: Number(marks),
    maxMarks: Number(maxMarks),
    gradedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getAllMarks() {
  const snap = await getDocs(collection(db, "marks"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getMarksForStudent(studentEmail) {
  const q = query(
    collection(db, "marks"),
    where("studentEmail", "==", studentEmail)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Students ──────────────────────────────────────────────────────────────────

export async function getAllStudents() {
  try {
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn("getAllStudents: permission denied or error, returning empty", e);
    return [];
  }
}

// Fallback: extract unique student emails from all assignments' assignedTo arrays
// Used when users collection is not readable by teacher
export async function getStudentsFromAssignments() {
  try {
    const snap = await getDocs(collection(db, "assignments"));
    const emailSet = new Set();
    snap.docs.forEach(d => {
      const data = d.data();
      (data.assignedTo || []).forEach(email => emailSet.add(email));
    });
    // Try to get names from users collection for each email
    const students = [];
    for (const email of emailSet) {
      try {
        const uq = query(collection(db, "users"), where("email", "==", email));
        const usnap = await getDocs(uq);
        if (!usnap.empty) {
          students.push({ id: usnap.docs[0].id, ...usnap.docs[0].data() });
        } else {
          students.push({ id: email, email, name: email, role: "student" });
        }
      } catch {
        students.push({ id: email, email, name: email, role: "student" });
      }
    }
    return students;
  } catch (e) {
    console.warn("getStudentsFromAssignments error", e);
    return [];
  }
}
