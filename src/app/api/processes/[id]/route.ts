import { ProcessStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { updateProcess } from "@/lib/processes";

const updateProcessSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().min(2),
  owner: z.string().trim().min(2),
  status: z.nativeEnum(ProcessStatus),
  flowData: z.unknown(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = updateProcessSchema.parse(await request.json());

    await updateProcess({
      id,
      ...payload,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Payload inválido para salvar processo.", details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Falha ao salvar o processo." }, { status: 500 });
  }
}
