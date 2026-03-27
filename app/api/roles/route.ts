import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows]: any = await pool.execute("SELECT * FROM roles ORDER BY created_at ASC");
        const roles = rows.map((r: any) => ({
            id: r.id, 
            name: r.name, 
            code: r.code, 
            desc: r.description,
            color: r.color, 
            bg: r.bg, 
            border: r.border, 
            createdBy: r.created_by,
            status: r.status || 'Active', // <-- Added status mapping
            privs: typeof r.privileges === 'string' ? JSON.parse(r.privileges) : r.privileges
        }));
        return NextResponse.json(roles);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const privsJson = JSON.stringify(data.privs);
        const [result]: any = await pool.execute(
            // <-- Added status to INSERT
            `INSERT INTO roles (name, code, description, color, bg, border, created_by, status, privileges) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [data.name, data.code, data.desc || null, data.color, data.bg, data.border, data.createdBy || 'System', data.status || 'Active', privsJson]
        );
        return NextResponse.json({ success: true, id: result.insertId });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: "Role Name or Code already exists." }, { status: 400 });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const data = await req.json();
        const privsJson = JSON.stringify(data.privs);
        await pool.execute(
            // <-- Added status to UPDATE
            `UPDATE roles SET name=?, code=?, description=?, color=?, bg=?, border=?, status=?, privileges=? WHERE id=?`,
            [data.name, data.code, data.desc || null, data.color, data.bg, data.border, data.status || 'Active', privsJson, data.id]
        );
        return NextResponse.json({ success: true });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: "Role Name or Code already exists." }, { status: 400 });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
        
        await pool.execute(`DELETE FROM roles WHERE id=?`, [id]);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}