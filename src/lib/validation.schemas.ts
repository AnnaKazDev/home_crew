import { z } from "zod";

/**
 * Zod schema for validating query parameters for GET /v1/points-events
 * Validates pagination and filtering parameters
 */
export const GetPointsEventsQuerySchema = z
  .object({
    cursor: z
      .string()
      .optional()
      .refine((val) => !val || /^[A-Za-z0-9+/]*={0,2}$/.test(val), {
        message: "Cursor must be valid base64 string",
      }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine((val) => val === undefined || (val >= 1 && val <= 100), {
        message: "Limit must be between 1 and 100",
      }),
    event_type: z.enum(["add", "subtract"]).optional(),
    from_date: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: "from_date must be in YYYY-MM-DD format",
      }),
    to_date: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: "to_date must be in YYYY-MM-DD format",
      }),
  })
  .refine(
    (data) => {
      // Custom validation: from_date should not be after to_date
      if (data.from_date && data.to_date) {
        return data.from_date <= data.to_date;
      }
      return true;
    },
    {
      message: "from_date cannot be after to_date",
      path: ["from_date"], // This will show the error on from_date field
    }
  );

export type GetPointsEventsQueryType = z.infer<typeof GetPointsEventsQuerySchema>;
