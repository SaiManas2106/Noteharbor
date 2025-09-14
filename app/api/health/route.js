export const runtime = 'nodejs';
import { withCors, preflight } from '../../../lib/cors';
export async function GET() { return withCors(JSON.stringify({ status: 'ok' }), { headers: { 'Content-Type': 'application/json' } }); }
export async function OPTIONS() { return preflight(); }
