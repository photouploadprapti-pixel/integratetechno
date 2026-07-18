import type { AdminNavItem, AdminTableColumn, AdminTableRow, UserRole } from '@/types/admin'

/** Full module list; filtered per role at render time. */
export const adminNavItems: AdminNavItem[] = [
  {
    label: 'MOM Report',
    href: '/admin/mom',
    description: 'Minutes of Meeting reports',
  },
  {
    label: 'Sales Commission',
    href: '/admin/sales-commission',
    description: 'Sales commission entries by LC',
  },
  {
    label: 'S/I/S Report',
    href: '/admin/sis',
    description: 'Service / Installation / Sales reports',
  },
  {
    label: 'L.C./Income Per Annum',
    href: '/admin/income',
    description: 'Letter of credit and annual income',
  },
  {
    label: 'Cash Book',
    href: '/admin/cash-book',
    description: 'Cash book entries',
  },
  {
    label: 'Banking',
    href: '/admin/banking',
    description: 'Bank account standings',
  },
]

/**
 * Returns sidebar modules visible for a given role.
 * @param role - Signed-in user role
 */
export const getNavForRole = (role: UserRole | null): AdminNavItem[] => {
  if (role === 'super_admin') return adminNavItems
  if (role === 'admin') {
    return adminNavItems.filter(
      (item) =>
        item.href === '/admin/mom' ||
        item.href === '/admin/sales-commission' ||
        item.href === '/admin/sis' ||
        item.href === '/admin/cash-book',
    )
  }
  if (role === 'employee') {
    return adminNavItems.filter(
      (item) => item.href === '/admin/mom' || item.href === '/admin/sis',
    )
  }
  return []
}

/** @deprecated Use adminNavItems / getNavForRole */
export const superAdminNav = adminNavItems

/** Sales Commission table columns. */
export const salesCommissionColumns: AdminTableColumn[] = [
  { key: 'lcNumber', label: 'LC Number' },
  { key: 'shipmentDate', label: 'Shipment Date' },
  { key: 'expiryDate', label: 'Expiry Date' },
  { key: 'manufacturerName', label: 'Manufacturer Name' },
  { key: 'customerName', label: 'Customer Name' },
  { key: 'lcAmount', label: 'LC Amount' },
  { key: 'commissionAmount', label: 'Commission Amount' },
  { key: 'remarks', label: 'Remarks' },
  { key: 'createdBy', label: 'Created By' },
]

/** MOM Report table columns. */
export const momColumns: AdminTableColumn[] = [
  { key: 'companyName', label: 'Company Name' },
  { key: 'machineType', label: 'Machine Type' },
  { key: 'typeOfVisit', label: 'Type of Visit' },
  { key: 'timeRange', label: 'Starting and Ending Time' },
  { key: 'daysTaken', label: 'Days Taken' },
  { key: 'technicians', label: 'Technicians' },
]

/** Sample MOM rows until Bubble data is migrated. */
export const momRows: AdminTableRow[] = [
  {
    id: '1',
    companyName: 'Popular Pharma',
    machineType: 'Die punch inspection',
    typeOfVisit: 'Service',
    timeRange: 'Feb 1, 2026 - Feb 3, 2026',
    daysTaken: '2 days',
    technicians: 'Prottay, Bristi',
  },
  {
    id: '2',
    companyName: 'Square Pharma',
    machineType: 'IR Machine',
    typeOfVisit: 'Service',
    timeRange: 'Feb 1, 2026 - Feb 3, 2026',
    daysTaken: '2 days',
    technicians: 'Prottay, Bristi',
  },
  {
    id: '3',
    companyName: 'Prapti',
    machineType: 'Test',
    typeOfVisit: 'Service',
    timeRange: 'Feb 1, 2026 - Feb 3, 2026',
    daysTaken: '2 days',
    technicians: 'Prottay, Bristi',
  },
]

/** S/I/S Report table columns. */
export const sisColumns: AdminTableColumn[] = [
  { key: 'customerName', label: 'Customer Name' },
  { key: 'machineName', label: 'Machine Name' },
  { key: 'machineModel', label: 'Machine Model' },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'reportDate', label: 'Report Date' },
  { key: 'contact', label: 'Contact Person & Phone' },
]

/** Sample S/I/S rows. */
export const sisRows: AdminTableRow[] = [
  {
    id: '1',
    customerName: 'test',
    machineName: 'test',
    machineModel: 'o04',
    manufacturer: 'test',
    reportDate: 'Feb 5, 2026 12:00 am',
    contact: 'test +8801776104565',
  },
]

/** L.C. / Income table columns. */
export const incomeColumns: AdminTableColumn[] = [
  { key: 'date', label: 'Date' },
  { key: 'lcNo', label: 'L/C No.' },
  { key: 'dateOfIssue', label: 'Date of Issue' },
  { key: 'dateOfShip', label: 'Date of Ship' },
  { key: 'dateOfExport', label: 'Date of Export' },
  { key: 'customer', label: 'Customer' },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'amount', label: 'Amount' },
  { key: 'commission', label: 'Commission' },
  { key: 'bank', label: 'Bank' },
  { key: 'remarks', label: 'Remarks' },
]

/** Sample income rows. */
export const incomeRows: AdminTableRow[] = [
  {
    id: '1',
    date: '01/02/2026',
    lcNo: '248614012411',
    dateOfIssue: '01/02/2026',
    dateOfShip: '01/02/2026',
    dateOfExport: '01/02/2026',
    customer: 'NOVARTIS',
    manufacturer: 'VIBRER Technology-Pvt LTD',
    amount: '4,740.00',
    commission: '0.00',
    remarks: 'ok',
  },
]

/** Cash book table columns. */
export const cashBookColumns: AdminTableColumn[] = [
  { key: 'date', label: 'Date' },
  { key: 'paymentType', label: 'Payment Type' },
  { key: 'amount', label: 'Amount' },
  { key: 'details', label: 'Details' },
  { key: 'remarks', label: 'Remarks' },
]

/** Sample cash book rows. */
export const cashBookRows: AdminTableRow[] = [
  {
    id: '1',
    date: '09/02/2026',
    paymentType: 'Cash',
    amount: '4,500.00',
    details: 'Test',
    remarks: 'Test',
  },
]

/** Banking table columns. */
export const bankingColumns: AdminTableColumn[] = [
  { key: 'date', label: 'Date' },
  { key: 'paymentType', label: 'Payment Type' },
  { key: 'amount', label: 'Amount' },
  { key: 'bankName', label: 'Bank' },
  { key: 'remarks', label: 'Remarks' },
  { key: 'received', label: 'Received?' },
]

/** Sample banking rows. */
export const bankingRows: AdminTableRow[] = [
  {
    id: '1',
    date: '11/02/2026',
    paymentType: 'Cash',
    amount: '4,500.00',
    bankName: 'Brac Bank',
    remarks: 'ok',
    received: 'Yes',
  },
]
