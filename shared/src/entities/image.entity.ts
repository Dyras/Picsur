import { z } from 'zod';
import { SHA256 } from '../util/common-regex';
import { IsEntityID } from '../validators/entity-id.validator';

export const EImageSchema = z.object({
  id: IsEntityID().optional(),
  hash: z.string().regex(SHA256),
  data: z.undefined(),
  mime: z.string(),
});
export type EImage = z.infer<typeof EImageSchema>;
