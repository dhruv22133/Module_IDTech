import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';

export type DashboardSummary = {
  total: number;
  atVendor: number;
  atSelf: number;
  inTransit: number;
  inMaintenance: number;
  retired: number;
  nearEol: number;
};

type SummaryRow = RowDataPacket & {
  total: number;
  atVendor: number;
  atSelf: number;
  inTransit: number;
  inMaintenance: number;
  retired: number;
  nearEol: number;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [rows] = await pool.query<SummaryRow[]>(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'AT_VENDOR' THEN 1 ELSE 0 END) AS atVendor,
      SUM(CASE WHEN status = 'AT_SELF' THEN 1 ELSE 0 END) AS atSelf,
      SUM(CASE WHEN status = 'IN_TRANSIT' THEN 1 ELSE 0 END) AS inTransit,
      SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) AS inMaintenance,
      SUM(CASE WHEN status IN ('RETIRED', 'SCRAPPED') THEN 1 ELSE 0 END) AS retired,
      SUM(CASE WHEN max_shots > 0 AND (current_shots / max_shots) >= 0.8 THEN 1 ELSE 0 END) AS nearEol
    FROM moulds`
  );

  const summary = rows[0];

  return {
    total: Number(summary?.total ?? 0),
    atVendor: Number(summary?.atVendor ?? 0),
    atSelf: Number(summary?.atSelf ?? 0),
    inTransit: Number(summary?.inTransit ?? 0),
    inMaintenance: Number(summary?.inMaintenance ?? 0),
    retired: Number(summary?.retired ?? 0),
    nearEol: Number(summary?.nearEol ?? 0),
  };
}
