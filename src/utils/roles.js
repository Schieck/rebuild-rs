import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore();

/**
 * Set or update the user's role and city association in Firestore.
 * @param {string} userId - The user's unique identifier (uid).
 * @param {string} role - The role to assign to the user.
 * @param {string} email - The user's email address.
 * @param {string} name - The user's name.
 * @param {string} city - The city identifier the user is associated with.
 */
async function setUserRole(userId, role, email, name, city) {
  const userRef = doc(db, "users", userId);
  await setDoc(
    userRef,
    {
      role,
      email,
      name,
      city,
    },
    { merge: true }
  );
}

export { setUserRole };
