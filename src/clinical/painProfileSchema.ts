import { z } from 'zod'

export const painProfileSchema = z.object({
  regionId: z.string().min(1),
  painTypes: z
    .array(
      z.enum([
        'aching',
        'sharp',
        'burning',
        'stabbing',
        'throbbing',
        'tingling',
        'numbness',
        'cramping',
        'pressure',
      ]),
    )
    .min(1, 'Select at least one pain type'),
  severity: z.number().int().min(1).max(10),
  onset: z.string().min(1, 'Tell us when it started'),
  betterFactors: z.array(z.string()),
  worseFactors: z.array(z.string()),
  radiatesTo: z.string().nullable(),
})
