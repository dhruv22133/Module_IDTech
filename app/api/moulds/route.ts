import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
    try {
        const [rows] = await pool.execute(`
            SELECT *, 
            tag_id as tagId, 
            mould_id_code as mouldIdAssetCode, 
            mould_name as mouldName, 
            asset_class_name as assetClassName, 
            supplier_name as supplierName, 
            DATE_FORMAT(created_at, '%d/%m/%Y') as regDate 
            FROM moulds ORDER BY created_at DESC
        `);
        return NextResponse.json(rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // ── File Upload Handler ──
        const saveFile = async (fileKey: string) => {
            const file = formData.get(fileKey) as File | null;
            if (!file || typeof file === "string") return null; // No file uploaded
            
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            // Create a unique filename to prevent overwriting
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.name) || '';
            const filename = `${uniqueSuffix}${ext}`;
            
            // Save to public/uploads/moulds
            const uploadDir = path.join(process.cwd(), 'public/uploads/moulds');
            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);
            
            return `/uploads/moulds/${filename}`;
        };

        const mouldImagePath = await saveFile('mouldImage');
        const cadFilePath = await saveFile('cadFile');

        // Helper to safely extract strings and numbers from FormData
        const getStr = (k: string) => { const v = formData.get(k); return v ? v.toString() : null; };
        const getNum = (k: string) => { const v = formData.get(k); return v ? Number(v) : 0; };

        // ADDED curr_loc to the INSERT statement, populating it with getStr('plant')
        const [result]: any = await pool.execute(
            `INSERT INTO moulds (
                tag_id, mould_id_code, mould_name, cost_center_code, cost_center_name, 
                supplier_code, supplier_name, po_number, po_date, cap_date, depr_calc_date, 
                depr_key, asset_life, mould_image, asset_class_code, asset_class_name, 
                sub_number, location_code, location_name, plant, curr_loc, base_uom, guaranteed_shots, 
                current_shots, description, cum_acq_value, trans_acq_value, cad_file, currency
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                getStr('tagId'), getStr('mouldIdAssetCode'), getStr('mouldName'), getStr('costCenterCode'), getStr('costCenterName'),
                getStr('supplierCode'), getStr('supplierName'), getStr('poNumber'), getStr('poDate'), getStr('capitalizationOn'),
                getStr('depreciationCalcOn'), getStr('depreciationOnKey'), getStr('assetLife'), mouldImagePath,
                getStr('assetClassCode'), getStr('assetClassName'), getStr('subNumber'), getStr('locationCode'), getStr('locationName'),
                getStr('plant'), getStr('plant'), getStr('baseUnitOfMeasure'), getNum('guaranteedLifeTotalShots'), getNum('currentShotCount'),
                getStr('description'), getNum('cumAcqValue'), getNum('transAcqValue'), cadFilePath, getStr('currency')
            ]
        );
        return NextResponse.json({ success: true, id: result.insertId });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: "Tag ID or Mould ID already exists." }, { status: 400 });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}