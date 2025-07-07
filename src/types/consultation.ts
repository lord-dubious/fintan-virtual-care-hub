/**
 * Front-end Consultation types.
 *
 * We re-export the canonical `Consultation` interface from `shared/domain.ts`
 * so the UI stays in sync with the backend / Prisma models.
 */
import type { Consultation } from '../../shared/domain';

/**
 * API response wrapper returned by the consultations endpoints.
 * NOTE: we keep `consultation` optional to align with legacy endpoints that
 * sometimes omit the data field when `success === false`.
 */
export interface ConsultationResponse {
  consultation: Consultation | null;
  success: boolean;
  message?: string;
}

export type { Consultation };
