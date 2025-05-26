import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export const gpxFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.type === 'application/gpx+xml' || file.name.endsWith('.gpx'),
    'File must be a GPX file'
  )
  .refine(
    (file) => file.size <= 50 * 1024 * 1024, // 50MB
    'File size must be less than 50MB'
  );

export const boundingBoxSchema = z.object({
  north: z.number().min(-90).max(90),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  west: z.number().min(-180).max(180),
}).refine(
  (data) => data.north > data.south,
  'North must be greater than south'
).refine(
  (data) => {
    const width = data.east - data.west;
    return width > 0 && width < 360;
  },
  'Invalid east/west bounds'
);

export const synthesisRequestSchema = z.object({
  referenceRaceId: z.string().uuid(),
  boundingBox: boundingBoxSchema,
  rollingWindow: z.number().min(10).max(1000),
  maxResults: z.number().min(1).max(50),
});
