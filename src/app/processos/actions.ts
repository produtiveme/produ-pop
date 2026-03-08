"use server";

import { redirect } from "next/navigation";
import { createInitialProcess } from "@/lib/processes";

export async function createProcessAction() {
  const process = await createInitialProcess();
  redirect(`/processos/${process.id}/editor`);
}
