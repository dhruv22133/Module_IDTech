import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [manufacturers] = await pool.execute("SELECT code, name FROM manufacturers");
        const [deprMethods] = await pool.execute("SELECT name FROM depreciation_methods");
        const [mouldTypes] = await pool.execute("SELECT code, name FROM mould_types");
        const [uoms] = await pool.execute("SELECT name FROM uom");
        const [costCenters] = await pool.execute("SELECT code, name FROM cost_centers");
        const [vendors] = await pool.execute("SELECT code, name FROM vendors");
        const [plants] = await pool.execute("SELECT code, name FROM plants");

        return NextResponse.json({ 
            manufacturers, 
            deprMethods, 
            mouldTypes, 
            uoms,
            costCenters,
            vendors,
            plants
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}