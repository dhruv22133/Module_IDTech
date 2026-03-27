import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const type = req.nextUrl.searchParams.get("type");
    try {
        let rows: any = [];
        
        if (type === 'vendors') [rows] = await pool.execute("SELECT * FROM vendors ORDER BY id DESC");
        else if (type === 'manufacturers') [rows] = await pool.execute("SELECT * FROM manufacturers ORDER BY id DESC");
        else if (type === 'mould_types') [rows] = await pool.execute("SELECT * FROM mould_types ORDER BY id DESC");
        else if (type === 'transfer_reasons') [rows] = await pool.execute("SELECT * FROM transfer_reasons ORDER BY id DESC");
        else if (type === 'depreciation_methods') [rows] = await pool.execute("SELECT * FROM depreciation_methods ORDER BY id DESC");
        else if (type === 'plants') [rows] = await pool.execute("SELECT * FROM plants ORDER BY id DESC");
        else if (type === 'departments') [rows] = await pool.execute("SELECT * FROM departments ORDER BY id DESC");
        else if (type === 'cost_centers') [rows] = await pool.execute("SELECT * FROM cost_centers ORDER BY id DESC");
        else if (type === 'technicians') [rows] = await pool.execute("SELECT * FROM technicians ORDER BY id DESC");
        else if (type === 'maint_vendors') [rows] = await pool.execute("SELECT * FROM maint_vendors ORDER BY id DESC");
        else return NextResponse.json({ error: "Invalid master type" }, { status: 400 });

        const formatted = rows.map((r: any) => {
            if (type === 'vendors' && r.machines && typeof r.machines === 'string') {
                try { r.machines = JSON.parse(r.machines); } 
                catch(e) { r.machines = []; }
            }
            // Map the old boolean 'active' field to the new 'status' standard for transfer_reasons
            if (type === 'transfer_reasons') r.status = (r.active === 1 || r.active === true) ? 'Active' : 'Inactive';
            else r.status = r.status || 'Active';
            
            return r;
        });

        return NextResponse.json(formatted);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const type = req.nextUrl.searchParams.get("type");
    try {
        const d = await req.json();
        let result: any;

        if (type === 'vendors') {
            [result] = await pool.execute(
                'INSERT INTO vendors (code, name, location, contact, email, phone, machines, created_by, status) VALUES (?,?,?,?,?,?,?,?,?)', 
                [d.code, d.name, d.location || null, d.contact || null, d.email || null, d.phone || null, JSON.stringify(d.machines || []), d.createdBy || 'System', d.status || 'Active']
            );
        } else if (type === 'manufacturers') {
            [result] = await pool.execute('INSERT INTO manufacturers (code, name, country, contact, email, phone, specialty, status) VALUES (?,?,?,?,?,?,?,?)', [d.code, d.name, d.country || null, d.contact || null, d.email || null, d.phone || null, d.specialty || null, d.status || 'Active']);
        } else if (type === 'mould_types') {
            [result] = await pool.execute('INSERT INTO mould_types (code, name, description, cavities, material, status) VALUES (?,?,?,?,?,?)', [d.code, d.name, d.description || null, d.cavities || null, d.material || null, d.status || 'Active']);
        } else if (type === 'transfer_reasons') {
            [result] = await pool.execute('INSERT INTO transfer_reasons (code, name, description, active) VALUES (?,?,?,?)', [d.code, d.name, d.description || null, d.status === 'Active' ? 1 : 0]);
        } else if (type === 'depreciation_methods') {
            [result] = await pool.execute('INSERT INTO depreciation_methods (code, name, abbr, description, rate, status) VALUES (?,?,?,?,?,?)', [d.code, d.name, d.abbr || null, d.description || null, d.rate || null, d.status || 'Active']);
        } else if (type === 'plants') {
            [result] = await pool.execute('INSERT INTO plants (code, name, location, contact, email, phone, created_by, status) VALUES (?,?,?,?,?,?,?,?)', [d.code, d.name, d.location || null, d.contact || null, d.email || null, d.phone || null, d.createdBy || 'System', d.status || 'Active']);
        } else if (type === 'departments') {
            [result] = await pool.execute('INSERT INTO departments (code, name, created_by, status) VALUES (?,?,?,?)', [d.code, d.name, d.createdBy || 'System', d.status || 'Active']);
        } else if (type === 'cost_centers') {
            [result] = await pool.execute('INSERT INTO cost_centers (code, name, created_by, status) VALUES (?,?,?,?)', [d.code, d.name, d.createdBy || 'System', d.status || 'Active']);
        } else if (type === 'technicians') {
            [result] = await pool.execute('INSERT INTO technicians (code, name, speciality, shift, status) VALUES (?,?,?,?,?)', [d.code, d.name, d.speciality || null, d.shift || null, d.status || 'Active']);
        } else if (type === 'maint_vendors') {
            [result] = await pool.execute('INSERT INTO maint_vendors (code, name, city, status) VALUES (?,?,?,?)', [d.code, d.name, d.city || null, d.status || 'Active']);
        }

        return NextResponse.json({ success: true, id: result.insertId });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: "Code already exists." }, { status: 400 });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const type = req.nextUrl.searchParams.get("type");
    try {
        const d = await req.json();

        if (type === 'vendors') {
            await pool.execute(
                'UPDATE vendors SET code=?, name=?, location=?, contact=?, email=?, phone=?, machines=?, status=? WHERE id=?', 
                [d.code, d.name, d.location || null, d.contact || null, d.email || null, d.phone || null, JSON.stringify(d.machines || []), d.status || 'Active', d.id]
            );
        } else if (type === 'manufacturers') {
            await pool.execute('UPDATE manufacturers SET code=?, name=?, country=?, contact=?, email=?, phone=?, specialty=?, status=? WHERE id=?', [d.code, d.name, d.country || null, d.contact || null, d.email || null, d.phone || null, d.specialty || null, d.status || 'Active', d.id]);
        } else if (type === 'mould_types') {
            await pool.execute('UPDATE mould_types SET code=?, name=?, description=?, cavities=?, material=?, status=? WHERE id=?', [d.code, d.name, d.description || null, d.cavities || null, d.material || null, d.status || 'Active', d.id]);
        } else if (type === 'transfer_reasons') {
            await pool.execute('UPDATE transfer_reasons SET code=?, name=?, description=?, active=? WHERE id=?', [d.code, d.name, d.description || null, d.status === 'Active' ? 1 : 0, d.id]);
        } else if (type === 'depreciation_methods') {
            await pool.execute('UPDATE depreciation_methods SET code=?, name=?, abbr=?, description=?, rate=?, status=? WHERE id=?', [d.code, d.name, d.abbr || null, d.description || null, d.rate || null, d.status || 'Active', d.id]);
        } else if (type === 'plants') {
            await pool.execute('UPDATE plants SET code=?, name=?, location=?, contact=?, email=?, phone=?, status=? WHERE id=?', [d.code, d.name, d.location || null, d.contact || null, d.email || null, d.phone || null, d.status || 'Active', d.id]);
        } else if (type === 'departments') {
            await pool.execute('UPDATE departments SET code=?, name=?, status=? WHERE id=?', [d.code, d.name, d.status || 'Active', d.id]);
        } else if (type === 'cost_centers') {
            await pool.execute('UPDATE cost_centers SET code=?, name=?, updated_by=?, status=? WHERE id=?', [d.code, d.name, d.createdBy || 'System', d.status || 'Active', d.id]);
        } else if (type === 'technicians') {
            await pool.execute('UPDATE technicians SET code=?, name=?, speciality=?, shift=?, status=? WHERE id=?', [d.code, d.name, d.speciality || null, d.shift || null, d.status || 'Active', d.id]);
        } else if (type === 'maint_vendors') {
            await pool.execute('UPDATE maint_vendors SET code=?, name=?, city=?, status=? WHERE id=?', [d.code, d.name, d.city || null, d.status || 'Active', d.id]);
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: "Code already exists." }, { status: 400 });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}