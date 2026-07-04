import { z } from 'zod'

const riskTierSchema = z.enum(['emergency', 'urgent', 'primary-care', 'self-care'])

const questionOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
})

const questionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  options: z.array(questionOptionSchema).min(2),
})

const treeNodeSchema = z.object({
  question: questionSchema,
  next: z.record(z.string(), z.string().nullable()),
})

const differentialSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  baseWeight: z.number().min(0).max(10),
  supports: z.record(z.string(), z.array(z.string().min(1))),
  tier: riskTierSchema,
  specialty: z.string().min(1),
  suggestedTests: z.array(z.string().min(1)),
  explanation: z.string().min(1),
})

const redFlagSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  tier: riskTierSchema,
  when: z
    .array(z.object({ questionId: z.string().min(1), answers: z.array(z.string().min(1)).min(1) }))
    .min(1),
  minSeverity: z.number().int().min(1).max(10).optional(),
})

export const contentPackSchema = z
  .object({
    regionId: z.string().min(1),
    entryNodeId: z.string().min(1),
    nodes: z.record(z.string(), treeNodeSchema),
    differentials: z.array(differentialSchema).min(1),
    redFlags: z.array(redFlagSchema),
  })
  .superRefine((pack, ctx) => {
    const nodeIds = new Set(Object.keys(pack.nodes))
    const questionIds = new Set(Object.values(pack.nodes).map((n) => n.question.id))

    if (!nodeIds.has(pack.entryNodeId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `entryNodeId "${pack.entryNodeId}" is missing from nodes`,
        path: ['entryNodeId'],
      })
    }

    for (const [nodeId, node] of Object.entries(pack.nodes)) {
      const optionValues = new Set(node.question.options.map((o) => o.value))
      for (const [answer, target] of Object.entries(node.next)) {
        if (!optionValues.has(answer)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `node "${nodeId}" routes answer "${answer}" that is not an option`,
            path: ['nodes', nodeId, 'next'],
          })
        }
        if (target !== null && !nodeIds.has(target)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `node "${nodeId}" answer "${answer}" points to missing node "${target}"`,
            path: ['nodes', nodeId, 'next'],
          })
        }
      }
      for (const optionValue of optionValues) {
        if (!(optionValue in node.next)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `node "${nodeId}" option "${optionValue}" has no route in next`,
            path: ['nodes', nodeId, 'next'],
          })
        }
      }
    }

    for (const differential of pack.differentials) {
      for (const questionId of Object.keys(differential.supports)) {
        if (!questionIds.has(questionId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `differential "${differential.id}" supports unknown question "${questionId}"`,
            path: ['differentials'],
          })
        }
      }
    }

    for (const flag of pack.redFlags) {
      for (const condition of flag.when) {
        if (!questionIds.has(condition.questionId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `red flag "${flag.id}" references unknown question "${condition.questionId}"`,
            path: ['redFlags'],
          })
        }
      }
    }
  })

export type ParsedContentPack = z.infer<typeof contentPackSchema>
