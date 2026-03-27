import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [rows]: any = await pool.execute("SELECT * FROM transfers ORDER BY created_at DESC");
        
        const formatted = rows.map((r: any) => ({
            id: r.transfer_id,
            challanNo: r.challan_no,
            mouldId: r.mould_id,
            mouldName: r.mould_name,
            mouldType: r.mould_type,
            transferType: r.transfer_type,
            fromType: r.from_type,
            fromCode: r.from_code,
            fromName: r.from_name,
            toType: r.to_type,
            toCode: r.to_code,
            toName: r.to_name,
            reason: r.reason,
            expectedReturn: r.expected_return ? new Date(r.expected_return).toISOString().split('T')[0] : "",
            vehicleNo: r.vehicle_no,
            consignmentNo: r.consignment_no,
            remarks: r.remarks,
            status: r.status,
            maker: { name: r.maker_name, avatar: r.maker_avatar },
            approver: r.approver_name ? { name: r.approver_name, avatar: r.approver_avatar } : null,
            approvalRemark: r.approval_remark,
            challanImages: typeof r.challan_images === 'string' ? JSON.parse(r.challan_images) : (r.challan_images || []),
            timeline: typeof r.timeline === 'string' ? JSON.parse(r.timeline) : (r.timeline || []),
            createdAt: r.created_at ? new Date(r.created_at).toLocaleString("en-IN", {day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : ""
        }));
        
        return NextResponse.json(formatted);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        
        // ── Handle Multiple File Uploads ──
        const files = formData.getAll("challanImages");
        const savedImagePaths = [];
        
        for (const file of files) {
            if (file && typeof file !== "string") {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = path.extname((file as File).name) || '';
                const filename = `${uniqueSuffix}${ext}`;
                
                const uploadDir = path.join(process.cwd(), 'public/uploads/challans');
                await mkdir(uploadDir, { recursive: true });
                await writeFile(path.join(uploadDir, filename), buffer);
                
                savedImagePaths.push({ url: `/uploads/challans/${filename}`, name: (file as File).name });
            }
        }

        const getStr = (k: string) => { const v = formData.get(k); return v ? v.toString() : null; };

        // Reconstruct nested JSON objects sent via FormData
        const maker = JSON.parse(getStr('maker') || "{}");
        const timeline = JSON.parse(getStr('timeline') || "[]");

        await pool.execute(
            `INSERT INTO transfers (
                transfer_id, challan_no, mould_id, mould_name, mould_type, transfer_type,
                from_type, from_code, from_name, to_type, to_code, to_name, reason,
                expected_return, vehicle_no, consignment_no, remarks, status, maker_name,
                maker_avatar, timeline, challan_images
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                getStr('id'), getStr('challanNo'), getStr('mouldId'), getStr('mouldName'), getStr('mouldType'), getStr('transferType'),
                getStr('fromType'), getStr('fromCode'), getStr('fromName'), getStr('toType'), getStr('toCode'), getStr('toName'), getStr('reason'),
                getStr('expectedReturn'), getStr('vehicleNo'), getStr('consignmentNo'), getStr('remarks'), getStr('status'), maker.name,
                maker.avatar, JSON.stringify(timeline), JSON.stringify(savedImagePaths)
            ]
        );
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const d = await req.json();
        
        // 1. Update the Transfer & Challan workflow status
        await pool.execute(
            `UPDATE transfers SET status=?, approver_name=?, approver_avatar=?, approval_remark=?, timeline=? WHERE transfer_id=?`,
            [d.status, d.approver?.name || null, d.approver?.avatar || null, d.approvalRemark || null, JSON.stringify(d.timeline || []), d.id]
        );

        // 2. If the Transfer is Approved, intercept and update the mould's Current Location (curr_loc)
        // Note: Change 'Approved' if your frontend uses a different exact string (e.g., 'In Transit')
        if (d.status === 'Approved') {
            
            // First, fetch exactly which mould is moving, and where it is going
            const [transferRows]: any = await pool.execute(
                `SELECT mould_id, to_name FROM transfers WHERE transfer_id = ?`,
                [d.id]
            );

            // If the record is found, update the moulds table
            if (transferRows && transferRows.length > 0) {
                const { mould_id, to_name } = transferRows[0];
                
                await pool.execute(
                    `UPDATE moulds SET curr_loc = ? WHERE mould_id_code = ?`,
                    [to_name, mould_id]
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}