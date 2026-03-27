import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = 'force-dynamic';

// Helper function to securely save physical files to the server
async function handleFileUploads(formData: FormData, fieldName: string) {
    const files = formData.getAll(fieldName);
    const paths = [];
    for (const file of files) {
        if (file && typeof file !== "string") {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname((file as File).name) || '';
            const filename = `${uniqueSuffix}${ext}`;
            
            const uploadDir = path.join(process.cwd(), 'public/uploads/maintenance');
            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);
            
            paths.push({ url: `/uploads/maintenance/${filename}`, name: (file as File).name });
        }
    }
    return paths;
}

export async function GET() {
    try {
        const [rows]: any = await pool.execute("SELECT * FROM maintenance_records ORDER BY created_at DESC");
        
        const formatted = rows.map((r: any) => ({
            id: r.id,
            workOrderNo: r.work_order_no,
            mouldId: r.mould_id,
            mouldName: r.mould_name,
            mouldType: r.mould_type,
            plant: r.plant,
            maintenanceType: r.maintenance_type,
            priority: r.priority,
            issueCategory: r.issue_category,
            issueDescription: r.issue_description,
            reportedBy: r.reported_by,
            reportedDate: r.reported_date ? new Date(r.reported_date).toISOString().split('T')[0] : "",
            scheduledStart: r.scheduled_start ? new Date(r.scheduled_start).toISOString().split('T')[0] : "",
            scheduledEnd: r.scheduled_end ? new Date(r.scheduled_end).toISOString().split('T')[0] : "",
            actualStart: r.actual_start ? new Date(r.actual_start).toISOString().split('T')[0] : "",
            actualEnd: r.actual_end ? new Date(r.actual_end).toISOString().split('T')[0] : "",
            assignedTechnician: r.assigned_technician,
            assignedVendor: r.assigned_vendor,
            maintenanceLocation: r.maintenance_location,
            shotCountAtMaint: r.shot_count_at_maint,
            estimatedCost: r.estimated_cost,
            actualCost: r.actual_cost,
            sparesUsed: typeof r.spares_used === 'string' ? JSON.parse(r.spares_used) : (r.spares_used || []),
            checklistItems: typeof r.checklist_items === 'string' ? JSON.parse(r.checklist_items) : (r.checklist_items || []),
            beforeImages: typeof r.before_images === 'string' ? JSON.parse(r.before_images) : (r.before_images || []),
            afterImages: typeof r.after_images === 'string' ? JSON.parse(r.after_images) : (r.after_images || []),
            rootCause: r.root_cause,
            correctiveAction: r.corrective_action,
            preventiveAction: r.preventive_action,
            downtime: r.downtime,
            status: r.status,
            maker: r.maker_name ? { name: r.maker_name } : null,
            approver: r.approver_name ? { name: r.approver_name } : null,
            remarks: r.remarks,
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
        
        // Handle Physical File Uploads
        const beforeImages = await handleFileUploads(formData, 'beforeImages');
        const afterImages = await handleFileUploads(formData, 'afterImages');

        // Helpers to extract data safely
        const getStr = (k: string) => { const v = formData.get(k); return v ? v.toString() : null; };
        const getNum = (k: string) => { const v = formData.get(k); return v ? Number(v) : 0; };
        const getJson = (k: string) => { const v = formData.get(k); return v ? JSON.parse(v.toString()) : []; };

        const maker = getJson('maker');

        await pool.execute(
            `INSERT INTO maintenance_records (
                id, work_order_no, mould_id, mould_name, mould_type, plant, maintenance_type, priority,
                issue_category, issue_description, reported_by, reported_date, scheduled_start, scheduled_end,
                actual_start, actual_end, assigned_technician, assigned_vendor, maintenance_location, 
                shot_count_at_maint, estimated_cost, actual_cost, spares_used, checklist_items, 
                before_images, after_images, root_cause, corrective_action, preventive_action, 
                downtime, status, maker_name, approver_name, remarks, timeline
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                getStr('id'), getStr('workOrderNo'), getStr('mouldId'), getStr('mouldName'), getStr('mouldType'), getStr('plant'), getStr('maintenanceType'), getStr('priority'),
                getStr('issueCategory'), getStr('issueDescription'), getStr('reportedBy'), getStr('reportedDate'), getStr('scheduledStart'), getStr('scheduledEnd'),
                getStr('actualStart'), getStr('actualEnd'), getStr('assignedTechnician'), getStr('assignedVendor'), getStr('maintenanceLocation'), 
                getNum('shotCountAtMaint'), getNum('estimatedCost'), getNum('actualCost'), JSON.stringify(getJson('sparesUsed')), JSON.stringify(getJson('checklistItems')), 
                JSON.stringify(beforeImages), JSON.stringify(afterImages), getStr('rootCause'), getStr('correctiveAction'), getStr('preventiveAction'), 
                getNum('downtime'), getStr('status'), maker.name || null, getStr('approverName'), getStr('remarks'), JSON.stringify(getJson('timeline'))
            ]
        );
        return NextResponse.json({ success: true });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: "Maintenance ID already exists." }, { status: 400 });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const d = await req.json();
        
        await pool.execute(
            `UPDATE maintenance_records SET 
                assigned_technician=?, assigned_vendor=?,
                status=?, actual_start=?, actual_end=?, actual_cost=?, downtime=?, 
                root_cause=?, corrective_action=?, preventive_action=?, 
                spares_used=?, checklist_items=?, before_images=?, after_images=?, 
                approver_name=?, timeline=? 
            WHERE id=?`,
            [
                d.assignedTechnician || null, d.assignedVendor || null,
                d.status, d.actualStart || null, d.actualEnd || null, d.actualCost || 0, d.downtime || 0,
                d.rootCause || null, d.correctiveAction || null, d.preventiveAction || null, 
                JSON.stringify(d.sparesUsed || []), JSON.stringify(d.checklistItems || []), 
                JSON.stringify(d.beforeImages || []), JSON.stringify(d.afterImages || []),
                d.approver?.name || null, JSON.stringify(d.timeline || []), d.id
            ]
        );
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await pool.execute('DELETE FROM maintenance_records WHERE id=?', [id]);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}