import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = 'force-dynamic';

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
            
            const uploadDir = path.join(process.cwd(), 'public/uploads/scrap');
            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);
            
            paths.push({ url: `/uploads/scrap/${filename}`, name: (file as File).name });
        }
    }
    return paths;
}

export async function GET() {
    try {
        const [rows]: any = await pool.execute("SELECT * FROM scrap_records ORDER BY created_at DESC");
        
        const formatted = rows.map((r: any) => ({
            id: r.id,
            mouldId: r.mould_id,
            mouldName: r.mould_name,
            mouldType: r.mould_type,
            plant: r.plant,
            scrapReason: r.scrap_reason,
            reasonDetail: r.reason_detail,
            conditionRating: r.condition_rating,
            evaluationScore: r.evaluation_score,
            evaluationChecklist: typeof r.evaluation_checklist === 'string' ? JSON.parse(r.evaluation_checklist) : (r.evaluation_checklist || []),
            disposalMethod: r.disposal_method,
            scrapVendor: r.scrap_vendor,
            scrapWeight: r.scrap_weight,
            scrapRate: r.scrap_rate,
            estimatedScrapValue: r.estimated_scrap_value,
            originalAssetValue: r.original_asset_value,
            currentBookValue: r.current_book_value,
            accumulatedDepreciation: r.accumulated_depreciation,
            netLoss: r.net_loss,
            salvageValue: r.salvage_value,
            environmentalClearance: r.environmental_clearance,
            conditionPhotos: typeof r.condition_photos === 'string' ? JSON.parse(r.condition_photos) : (r.condition_photos || []),
            documents: typeof r.documents === 'string' ? JSON.parse(r.documents) : (r.documents || []),
            remarks: r.remarks,
            status: r.status,
            requestedBy: r.requested_by ? { name: r.requested_by } : null,
            requestDate: r.request_date ? new Date(r.request_date).toISOString().split('T')[0] : "",
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
        const conditionPhotos = await handleFileUploads(formData, 'conditionPhotos');
        const documents = await handleFileUploads(formData, 'documents');

        const getStr = (k: string) => { const v = formData.get(k); return v ? v.toString() : null; };
        const getNum = (k: string) => { const v = formData.get(k); return v ? Number(v) : 0; };
        const getJson = (k: string) => { const v = formData.get(k); return v ? JSON.parse(v.toString()) : []; };

        const maker = getJson('requestedBy');

        await pool.execute(
            `INSERT INTO scrap_records (
                id, mould_id, mould_name, mould_type, plant, scrap_reason, reason_detail, condition_rating,
                evaluation_score, evaluation_checklist, disposal_method, scrap_vendor, scrap_weight, scrap_rate,
                estimated_scrap_value, original_asset_value, current_book_value, accumulated_depreciation, net_loss,
                salvage_value, environmental_clearance, condition_photos, documents, remarks, status, requested_by, 
                request_date, timeline
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                getStr('id'), getStr('mouldId'), getStr('mouldName'), getStr('mouldType'), getStr('plant'), getStr('scrapReason'),
                getStr('reasonDetail'), getStr('conditionRating'), getNum('evaluationScore'), JSON.stringify(getJson('evaluationChecklist')),
                getStr('disposalMethod'), getStr('scrapVendor'), getNum('scrapWeight'), getNum('scrapRate'), getNum('estimatedScrapValue'),
                getNum('originalAssetValue'), getNum('currentBookValue'), getNum('accumulatedDepreciation'), getNum('netLoss'),
                getNum('salvageValue'), getStr('environmentalClearance'), JSON.stringify(conditionPhotos), JSON.stringify(documents),
                getStr('remarks'), getStr('status'), maker?.name || null, getStr('requestDate'), JSON.stringify(getJson('timeline'))
            ]
        );
        return NextResponse.json({ success: true });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: "Scrap ID already exists." }, { status: 400 });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await pool.execute('DELETE FROM scrap_records WHERE id=?', [id]);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}