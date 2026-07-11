/**
 * Seeds realistic dummy rows into Super Admin tables for UI testing.
 * Usage: node scripts/seed-dummy-data.js
 */
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const loadEnv = () =>
  Object.fromEntries(
    fs
      .readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const i = line.indexOf('=')
        return [line.slice(0, i), line.slice(i + 1)]
      }),
  )

const main = async () => {
  const env = loadEnv()
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: users } = await admin.from('users').select('id,email,role')
  const superAdmin = users?.find((u) => u.role === 'super_admin')
  const createdBy = superAdmin?.id || null

  // Clear existing demo rows so re-runs stay predictable
  for (const table of ['bank_stat', 'cash_book', 'income_per_annum', 's_i_s_report', 'mom_report']) {
    const { error } = await admin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) throw new Error(`${table} clear failed: ${error.message}`)
  }

  const { data: moms, error: momErr } = await admin
    .from('mom_report')
    .insert([
      {
        company_name: 'Popular Pharmaceuticals Ltd',
        company_address: 'Tongi, Gazipur',
        type_of_machine: 'Tablet Compression Machine',
        machine_no: 'TCM-2041',
        type_of_visit: 'Service',
        starting_date: '2026-02-01',
        ending_date: '2026-02-03',
        days_taken: '3',
        technicians_txt: 'Prottay, Bristi',
        mom_date: '2026-02-03',
        note: 'Minor vibration observed on turret.',
        conclusion: 'Machine restored to normal operation.',
        installation_report: 'N/A — service visit',
        machine_warrenty: true,
        created_by: createdBy,
      },
      {
        company_name: 'Square Pharmaceuticals PLC',
        company_address: 'Pabna, Bangladesh',
        type_of_machine: 'Capsule Filling Machine',
        machine_no: 'CFM-118',
        type_of_visit: 'Installation',
        starting_date: '2026-03-10',
        ending_date: '2026-03-14',
        days_taken: '5',
        technicians_txt: 'Prottay',
        mom_date: '2026-03-14',
        note: 'IQ/OQ completed with customer QA.',
        conclusion: 'Installation accepted by customer.',
        installation_report: 'Installed and validated successfully.',
        machine_warrenty: true,
        created_by: createdBy,
      },
      {
        company_name: 'Beximco Pharma',
        company_address: 'Tongi Industrial Area',
        type_of_machine: 'Dedusting Tunnel',
        machine_no: 'DT-55',
        type_of_visit: 'Service',
        starting_date: '2026-04-05',
        ending_date: '2026-04-06',
        days_taken: '2',
        technicians_txt: 'Bristi, Karim',
        mom_date: '2026-04-06',
        note: 'Replaced worn brushes.',
        conclusion: 'Dust extraction improved.',
        installation_report: '',
        machine_warrenty: false,
        created_by: createdBy,
      },
    ])
    .select('id,company_name')

  if (momErr) throw new Error(momErr.message)
  console.log('mom_report', moms.length)

  const { data: sis, error: sisErr } = await admin
    .from('s_i_s_report')
    .insert([
      {
        service_type: ['service'],
        customer_name: 'Incepta Pharmaceuticals',
        location: 'Savar, Dhaka',
        report_no: 'SIS-2026-001',
        date_of_report: '2026-02-12',
        work_starting_date: '2026-02-10',
        work_ending_date: '2026-02-12',
        mom_date: '2026-02-12',
        contact_person: 'Md. Hasan',
        dept_designation: 'Maintenance Manager',
        email: 'hasan@incepta.com',
        phone: '+8801711002200',
        machine_equipment_name: 'Blister Packaging Machine',
        machine_manufacturer: 'Uhlmann',
        model_no: 'UPS-4',
        sr_no: 'SR-7781',
        year_of_installation: '2021',
        under_warrenty: false,
        customer_training_provided: true,
        under_amc: true,
        environment_temp: '22C',
        rh: '45%',
        amc_no: 'AMC-334',
        visit: '2nd visit',
        nature_of_complaint: 'Sealing temperature unstable',
        observation: 'Thermocouple drift detected',
        action_taken: 'Replaced sensor and recalibrated',
        result_after_action_taken: 'Stable sealing temperature',
        spare_parts_required: 'Thermocouple kit',
        next_visit_required: 'After 3 months',
        after_three_months: 'Schedule preventive check',
        if_changable: true,
        service_charge: 15000,
        lump_charge: 2000,
        total_charge: 17000,
        debit_note_to_be_raised: true,
        debit_note_number: 'DN-501',
        debit_note_dt: '2026-02-13',
        customer_remarks: 'Satisfied with response time',
        created_by: createdBy,
      },
      {
        service_type: ['installation', 'sales_report'],
        customer_name: 'ACI Limited',
        location: 'Narayanganj',
        report_no: 'SIS-2026-002',
        date_of_report: '2026-03-20',
        work_starting_date: '2026-03-15',
        work_ending_date: '2026-03-20',
        mom_date: '2026-03-20',
        contact_person: 'Rina Akter',
        dept_designation: 'Plant Engineer',
        email: 'rina@aci.com',
        phone: '+8801811223344',
        machine_equipment_name: 'Roller Compactor',
        machine_manufacturer: 'Alexanderwerk',
        model_no: 'WP-120',
        sr_no: 'SR-9902',
        year_of_installation: '2026',
        under_warrenty: true,
        customer_training_provided: true,
        under_amc: false,
        environment_temp: '24C',
        rh: '50%',
        amc_no: '',
        visit: 'Installation',
        nature_of_complaint: 'New machine installation',
        observation: 'Site utilities verified',
        action_taken: 'Installed, aligned, and commissioned',
        result_after_action_taken: 'Ready for production',
        spare_parts_required: 'None',
        next_visit_required: 'Warranty follow-up in 30 days',
        after_three_months: 'Full performance review',
        if_changable: false,
        service_charge: 0,
        lump_charge: 5000,
        total_charge: 5000,
        debit_note_to_be_raised: false,
        debit_note_number: '',
        debit_note_dt: '',
        customer_remarks: 'Training completed for 4 operators',
        created_by: createdBy,
      },
      {
        service_type: ['service', 'installation'],
        customer_name: 'Healthcare Pharmaceuticals',
        location: 'Rajshahi',
        report_no: 'SIS-2026-003',
        date_of_report: '2026-05-08',
        work_starting_date: '2026-05-06',
        work_ending_date: '2026-05-08',
        mom_date: '2026-05-08',
        contact_person: 'Tanvir Ahmed',
        dept_designation: 'Production Head',
        email: 'tanvir@healthcare.com',
        phone: '+8801911334455',
        machine_equipment_name: 'Air Mist Shower',
        machine_manufacturer: 'ITT Partner',
        model_no: 'AMS-10',
        sr_no: 'SR-4410',
        year_of_installation: '2024',
        under_warrenty: true,
        customer_training_provided: false,
        under_amc: true,
        environment_temp: '23C',
        rh: '48%',
        amc_no: 'AMC-812',
        visit: '1st visit',
        nature_of_complaint: 'Nozzle clogging',
        observation: 'Hard water residue in lines',
        action_taken: 'Cleaned nozzles and flushed lines',
        result_after_action_taken: 'Spray pattern restored',
        spare_parts_required: 'Nozzle set x4',
        next_visit_required: 'Yes',
        after_three_months: 'Check water softener',
        if_changable: true,
        service_charge: 8500,
        lump_charge: 1500,
        total_charge: 10000,
        debit_note_to_be_raised: true,
        debit_note_number: 'DN-612',
        debit_note_dt: '2026-05-09',
        customer_remarks: 'Request AMC renewal quote',
        created_by: createdBy,
      },
    ])
    .select('id,customer_name')

  if (sisErr) throw new Error(sisErr.message)
  console.log('s_i_s_report', sis.length)

  const { data: income, error: incomeErr } = await admin
    .from('income_per_annum')
    .insert([
      {
        date: '2026-01-15',
        lc_no: '248614012411',
        date_of_issue: '2026-01-10',
        date_of_ship: '2026-02-01',
        date_of_export: '2026-02-05',
        customer: 'NOVARTIS',
        manufacturer: 'VIBRER Technology Pvt LTD',
        amount: 4740,
        commission: 237,
        bank: 'brac_bank',
        remarks: 'Partial shipment cleared',
        created_by: createdBy,
      },
      {
        date: '2026-03-02',
        lc_no: 'LC-BD-778812',
        date_of_issue: '2026-02-20',
        date_of_ship: '2026-03-18',
        date_of_export: '2026-03-22',
        customer: 'Eskayef Pharmaceuticals',
        manufacturer: 'FETTE Compacting',
        amount: 125000,
        commission: 6250,
        bank: 'ebl',
        remarks: 'Full amount received',
        created_by: createdBy,
      },
      {
        date: '2026-05-21',
        lc_no: 'LC-ITT-903344',
        date_of_issue: '2026-05-01',
        date_of_ship: '2026-06-10',
        date_of_export: '2026-06-14',
        customer: 'Renata Limited',
        manufacturer: 'Glatt GmbH',
        amount: 89000.5,
        commission: 0,
        bank: 'city_bank',
        remarks: 'Awaiting documents',
        created_by: createdBy,
      },
    ])
    .select('id,lc_no')

  if (incomeErr) throw new Error(incomeErr.message)
  console.log('income_per_annum', income.length)

  const { data: cash, error: cashErr } = await admin
    .from('cash_book')
    .insert([
      {
        date: '2026-02-09',
        payment_type: 'cash',
        amount: 4500,
        details: 'Local conveyance — Tongi visit',
        remarks: 'Paid to Prottay',
        created_by: createdBy,
      },
      {
        date: '2026-03-11',
        payment_type: 'cheque',
        amount: 22000,
        details: 'Spare parts purchase',
        remarks: 'Cheque no. 552211',
        created_by: createdBy,
      },
      {
        date: '2026-04-18',
        payment_type: 'cash',
        amount: 1800,
        details: 'Office stationery',
        remarks: 'Petty cash',
        created_by: createdBy,
      },
      {
        date: '2026-06-02',
        payment_type: 'cheque',
        amount: 50000,
        details: 'Vendor advance — packaging tools',
        remarks: 'Against PO-441',
        created_by: createdBy,
      },
    ])
    .select('id')

  if (cashErr) throw new Error(cashErr.message)
  console.log('cash_book', cash.length)

  const { data: bank, error: bankErr } = await admin
    .from('bank_stat')
    .insert([
      {
        date: '2026-02-11',
        payment_type: 'cash',
        amount: 4500,
        bank_name: 'brac_bank',
        remarks: 'Commission deposit',
        received: true,
        income_per_annum_id: income[0]?.id || null,
        created_by: createdBy,
      },
      {
        date: '2026-03-25',
        payment_type: 'cheque',
        amount: 6250,
        bank_name: 'ebl',
        remarks: 'LC commission — Eskayef',
        received: true,
        income_per_annum_id: income[1]?.id || null,
        created_by: createdBy,
      },
      {
        date: '2026-06-15',
        payment_type: 'cheque',
        amount: 12000,
        bank_name: 'ab_bank',
        remarks: 'Pending clearance',
        received: false,
        income_per_annum_id: income[2]?.id || null,
        created_by: createdBy,
      },
      {
        date: '2026-07-01',
        payment_type: 'cash',
        amount: 3000,
        bank_name: 'city_bank',
        remarks: 'Service fee receipt',
        received: true,
        created_by: createdBy,
      },
    ])
    .select('id')

  if (bankErr) throw new Error(bankErr.message)
  console.log('bank_stat', bank.length)

  console.log('seed_complete')
}

main().catch((error) => {
  console.error('seed_failed', error.message)
  process.exit(1)
})
