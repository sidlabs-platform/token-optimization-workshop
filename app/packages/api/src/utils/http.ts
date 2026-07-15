import type { Response } from 'express';
export function notFound(res: Response, resource: string, id: string): void {
  res.status(404).json({ error: `${resource} not found`, id });
}
