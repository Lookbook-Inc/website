import { BankBrowser } from "@/components/bank-browser";
import { PageHeading } from "@/components/ui";
import { readWeb } from "@/lib/data";
import type { EditLineListResponse, SongListResponse } from "@/types/api";

export default async function BanksPage() {
  const [songs, editLines] = await Promise.all([
    readWeb<SongListResponse>("/web/v1/banks/songs"),
    readWeb<EditLineListResponse>("/web/v1/banks/edits-lines"),
  ]);

  return (
    <div className="page banks-page">
      <PageHeading
        eyebrow="Creative source material"
        title="Banks"
        copy="A working library of songs and language for the edits ahead."
      />
      <BankBrowser songs={songs.items} editLines={editLines.items} />
    </div>
  );
}
