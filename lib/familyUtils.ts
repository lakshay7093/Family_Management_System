import { db } from "@/firebase/config"
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore"

// Generate a unique 8-character referral code
export function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create a new family with referral code
export async function createFamily(adminUserId: string, familyName: string) {
  const referralCode = generateReferralCode()
  const familyId = doc(collection(db, "families")).id

  await setDoc(doc(db, "families", familyId), {
    name: familyName,
    referralCode: referralCode,
    adminId: adminUserId,
    createdAt: new Date(),
    memberCount: 1,
  })

  // Update admin user with familyId
  await updateDoc(doc(db, "users", adminUserId), {
    familyId: familyId,
    role: "admin",
    status: "approved",
  })

  return { familyId, referralCode }
}

// Get family details
export async function getFamilyDetails(familyId: string) {
  const familyDoc = await getDoc(doc(db, "families", familyId))
  if (!familyDoc.exists()) return null
  return { id: familyDoc.id, ...familyDoc.data() }
}
