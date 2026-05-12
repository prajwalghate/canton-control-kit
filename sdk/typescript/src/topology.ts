export type HostedParticipantConfig = {
  participantId: string;
  adminApiUrl: string;
  partyId: string;
  permission: "submission" | "confirmation" | "observation";
};

export type PartyToParticipantCommand = {
  partyId: string;
  participants: Array<{
    participantId: string;
    permission: "Submission" | "Confirmation" | "Observation";
  }>;
  topologyReference: string;
};

export type CantonAdminCall = {
  method: "POST";
  path: string;
  body: unknown;
};

export function buildPartyToParticipantCommand(args: {
  partyId: string;
  participants: HostedParticipantConfig[];
  topologyReference: string;
}): PartyToParticipantCommand {
  return {
    partyId: args.partyId,
    participants: args.participants.map((participant) => ({
      participantId: participant.participantId,
      permission:
        participant.permission === "submission"
          ? "Submission"
          : participant.permission === "confirmation"
            ? "Confirmation"
            : "Observation",
    })),
    topologyReference: args.topologyReference,
  };
}

export function buildAdminApiCall(command: PartyToParticipantCommand): CantonAdminCall {
  return {
    method: "POST",
    path: "/v2/topology/party-to-participant-mappings",
    body: command,
  };
}

export function summarizeHostedParticipants(participants: HostedParticipantConfig[]): string {
  return participants
    .map((participant) => `${participant.participantId}:${participant.permission}`)
    .join(", ");
}
