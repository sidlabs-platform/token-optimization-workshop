// workshop reference solution — app/packages/shared/src/types/oncall.ts
// On-call + acknowledgement domain types for the SentinelOps incident workflow.

/** A person who can be paged and can acknowledge / own an incident. */
export interface OnCallEngineer {
  id: string;
  name: string;
  /** Rotation the engineer currently belongs to, e.g. "platform-primary". */
  rotation: string;
  /** Whether the engineer is currently on shift and pageable. */
  active: boolean;
}

/** Request body accepted by POST /api/incidents/:id/ack. */
export interface AcknowledgeRequest {
  engineerId: string;
  /** Optional free-text note captured with the acknowledgement. */
  note?: string;
}

/** Request body accepted by POST /api/incidents/:id/assign. */
export interface AssignRequest {
  engineerId: string;
}

/** Result of an acknowledgement or assignment mutation. */
export interface AckResult {
  accepted: boolean;
  reason?: string;
}
