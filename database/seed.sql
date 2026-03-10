USE module_idtech;

INSERT INTO plants (code, name, city)
VALUES
('PLT-MUM', 'Plant A', 'Mumbai'),
('PLT-PUN', 'Plant B', 'Pune'),
('PLT-NSK', 'Plant C', 'Nashik'),
('PLT-AUR', 'Plant D', 'Aurangabad')
ON DUPLICATE KEY UPDATE name = VALUES(name), city = VALUES(city);

INSERT INTO suppliers (code, name, contact_email, city)
VALUES
('SUP-001', 'Precision Tools', 'support@precisiontools.in', 'Mumbai'),
('SUP-002', 'Tata Moulds', 'ops@tatamoulds.in', 'Pune'),
('SUP-003', 'Elite Moulds', 'service@elitemoulds.in', 'Nashik')
ON DUPLICATE KEY UPDATE name = VALUES(name), contact_email = VALUES(contact_email), city = VALUES(city);

INSERT INTO moulds (mould_code, mould_name, part_name, part_number, plant_id, supplier_id, max_shots, current_shots, purchase_cost, status, commissioned_on)
SELECT 'MLD-0042', 'Bumper Front LH', 'Bumper Front LH', 'PN-1042', p.id, s.id, 500000, 470000, 2400000, 'IN_TRANSIT', '2021-04-15'
FROM plants p JOIN suppliers s ON p.code = 'PLT-MUM' AND s.code = 'SUP-001'
WHERE NOT EXISTS (SELECT 1 FROM moulds WHERE mould_code = 'MLD-0042')
UNION ALL
SELECT 'MLD-0118', 'Dashboard Panel RH', 'Dashboard Panel RH', 'PN-1118', p.id, s.id, 500000, 440000, 2150000, 'AT_VENDOR', '2021-09-01'
FROM plants p JOIN suppliers s ON p.code = 'PLT-PUN' AND s.code = 'SUP-002'
WHERE NOT EXISTS (SELECT 1 FROM moulds WHERE mould_code = 'MLD-0118')
UNION ALL
SELECT 'MLD-0203', 'Door Trim Inner LH', 'Door Trim Inner LH', 'PN-1203', p.id, s.id, 500000, 410000, 1985000, 'AT_SELF', '2022-01-11'
FROM plants p JOIN suppliers s ON p.code = 'PLT-MUM' AND s.code = 'SUP-003'
WHERE NOT EXISTS (SELECT 1 FROM moulds WHERE mould_code = 'MLD-0203');

INSERT INTO transfer_challans (challan_no, mould_id, from_entity, to_entity, transfer_type, status, dispatched_at, remarks)
SELECT 'TRF-2025-0892', m.id, 'Plant A', 'Vendor: Precision Tools', 'OUTBOUND', 'IN_TRANSIT', '2025-03-04 10:00:00', 'Routine vendor movement'
FROM moulds m WHERE m.mould_code = 'MLD-0042'
  AND NOT EXISTS (SELECT 1 FROM transfer_challans WHERE challan_no = 'TRF-2025-0892');

INSERT INTO maintenance_jobs (job_no, mould_id, vendor_id, maintenance_type, priority, status, opened_at, estimated_cost)
SELECT 'MNT-2025-001', m.id, s.id, 'PREVENTIVE', 'HIGH', 'IN_PROGRESS', '2025-03-01 09:00:00', 150000
FROM moulds m JOIN suppliers s ON s.code = 'SUP-001'
WHERE m.mould_code = 'MLD-0118'
  AND NOT EXISTS (SELECT 1 FROM maintenance_jobs WHERE job_no = 'MNT-2025-001');

INSERT INTO depreciation_entries (mould_id, fiscal_year, opening_value, depreciation_percent, depreciation_amount, closing_value)
SELECT m.id, '2025-2026', 2200000, 10.00, 220000, 1980000
FROM moulds m
WHERE m.mould_code = 'MLD-0042'
  AND NOT EXISTS (SELECT 1 FROM depreciation_entries WHERE mould_id = m.id AND fiscal_year = '2025-2026');

INSERT INTO scrap_records (scrap_no, mould_id, reason, approved_by, scrap_value, scrapped_at)
SELECT 'SCR-2024-014', m.id, 'EOL', 'Plant Head', 65000, '2024-12-15 14:30:00'
FROM moulds m
WHERE m.mould_code = 'MLD-0203'
  AND NOT EXISTS (SELECT 1 FROM scrap_records WHERE scrap_no = 'SCR-2024-014');
