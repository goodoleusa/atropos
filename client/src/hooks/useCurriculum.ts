import { useQuery } from "@tanstack/react-query";
import { ALL_CURRICULUM_TRACKS, AI_CURRICULUM_TRACKS, OSINT_CURRICULUM_TRACKS, type AICurriculumTrack } from "@/config/aiCurriculum";

function dbTrackToClientTrack(dbTrack: any): AICurriculumTrack {
  return {
    id: dbTrack.trackId,
    name: dbTrack.name,
    icon: dbTrack.icon,
    description: dbTrack.description,
    order: dbTrack.order,
    color: dbTrack.color,
    prerequisiteTrackIds: dbTrack.prerequisiteTrackIds || [],
    missions: (dbTrack.missions || []).map((m: any) => ({
      ...m,
      trackId: m.trackId || dbTrack.trackId,
    })),
  };
}

export function useCurriculum() {
  const { data: dbTracks, isLoading } = useQuery<any[]>({
    queryKey: ["/api/curriculum"],
    queryFn: () => fetch("/api/curriculum").then(r => {
      if (!r.ok) throw new Error("Failed to fetch curriculum");
      return r.json();
    }),
    staleTime: 60000,
    retry: 1,
  });

  const hasDbData = dbTracks && dbTracks.length > 0;

  const allTracks: AICurriculumTrack[] = hasDbData
    ? dbTracks.filter((t: any) => t.isActive !== false).map(dbTrackToClientTrack)
    : ALL_CURRICULUM_TRACKS;

  const aiTracks: AICurriculumTrack[] = hasDbData
    ? dbTracks.filter((t: any) => t.category === "ai" && t.isActive !== false).map(dbTrackToClientTrack)
    : AI_CURRICULUM_TRACKS;

  const osintTracks: AICurriculumTrack[] = hasDbData
    ? dbTracks.filter((t: any) => t.category === "osint" && t.isActive !== false).map(dbTrackToClientTrack)
    : OSINT_CURRICULUM_TRACKS;

  return {
    allTracks,
    aiTracks,
    osintTracks,
    isLoading,
    isFromDb: hasDbData,
  };
}
