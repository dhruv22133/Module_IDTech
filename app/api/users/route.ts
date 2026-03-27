import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.execute(
            "SELECT id, emp_id as empId, first_name as name, email, phone, role, plant, dept, status, DATE_FORMAT(last_login, '%d %b %Y, %H:%i') as lastLogin FROM users ORDER BY created_at DESC"
        );
        return NextResponse.json(rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const [result]: any = await pool.execute(
            `INSERT INTO users (emp_id, first_name, email, phone, role, plant, dept, status, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [data.empId, data.name, data.email, data.phone || null, data.role, data.plant, data.dept, data.status, hashedPassword]
        );
        return NextResponse.json({ success: true, id: result.insertId });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: "Email or Employee ID already exists." }, { status: 400 });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const data = await req.json();
        let query = `UPDATE users SET emp_id=?, first_name=?, email=?, phone=?, role=?, plant=?, dept=?, status=? WHERE id=?`;
        let params = [data.empId, data.name, data.email, data.phone || null, data.role, data.plant, data.dept, data.status, data.id];

        // Only update the password if the user typed a new one in the edit form
        if (data.password && data.password.trim() !== "") {
            const hashed = await bcrypt.hash(data.password, 10);
            query = `UPDATE users SET emp_id=?, first_name=?, email=?, phone=?, role=?, plant=?, dept=?, status=?, password=? WHERE id=?`;
            params = [data.empId, data.name, data.email, data.phone || null, data.role, data.plant, data.dept, data.status, hashed, data.id];
        }

        await pool.execute(query, params);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: "Email or Employee ID already in use." }, { status: 400 });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
        
        await pool.execute(`DELETE FROM users WHERE id=?`, [id]);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}