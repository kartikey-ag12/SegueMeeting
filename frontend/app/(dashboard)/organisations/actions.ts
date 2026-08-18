"use server";

import { fetchWithAuth } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOrganisation(formData: FormData) {
  const name = formData.get("name") as string;
  const physicalAddress = formData.get("physicalAddress") as string;
  const country = formData.get("country") as string;

  if (!name || !physicalAddress || !country) {
    return { error: "Please fill in all fields." };
  }

  const payload = {
    name,
    settings: {
      physicalAddress,
      country
    }
  };

  try {
    const res = await fetchWithAuth("/organisations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { error: errorText || "Failed to create organisation." };
    }
  } catch (err: any) {
    if (err?.digest && err.digest.startsWith('NEXT_REDIRECT')) throw err;
    console.error("Failed to create organisation:", err);
    return { error: "An unexpected error occurred." };
  }

  // If successful, revalidate the layout to refresh the sidebar memberships
  revalidatePath("/", "layout");
  redirect("/my-home");
}
