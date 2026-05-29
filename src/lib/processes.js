export const PROCESSES = {
  'lead-to-cash': {
    id: 'lead-to-cash',
    name: 'Lead to Cash',
    emoji: '💼',
    tagline: 'From first contact to closed deal — fully automated',
    timeEstimate: '8 minutes',
    exampleFinding:
      'Companies typically find 35–55% of Lead-to-Cash activities are still manual — representing 200+ hrs/week of avoidable work.',
    whatYouDiscover: [
      'Lead capture & qualification gaps',
      'CRM automation coverage (Salesforce, HubSpot)',
      'Contract & proposal generation efficiency',
      'Order management & fulfilment bottlenecks',
      'Invoice processing & revenue recognition',
    ],
    stages: [
      { id: 'l2c-1', name: 'Lead Capture & Qualification', description: 'Capturing inbound/outbound leads and qualifying them against ideal customer criteria before handoff to sales.' },
      { id: 'l2c-2', name: 'Opportunity Management', description: 'Managing the full sales cycle from qualified lead through pipeline stages to negotiation.' },
      { id: 'l2c-3', name: 'Proposal & Quoting', description: 'Generating accurate quotes and proposals, managing pricing approvals, and delivering to prospects.' },
      { id: 'l2c-4', name: 'Contract & Legal', description: 'Drafting, reviewing, redlining, approving, and executing customer contracts and NDAs.' },
      { id: 'l2c-5', name: 'Order Management', description: 'Processing confirmed orders, managing inventory availability, fulfilment orchestration, and shipping.' },
      { id: 'l2c-6', name: 'Invoice & Billing', description: 'Generating invoices, handling billing disputes, managing recurring billing cycles and revenue recognition.' },
      { id: 'l2c-7', name: 'Collections & Cash Application', description: 'Following up on overdue invoices, applying cash receipts, and reconciling accounts receivable.' },
    ],
  },
  'hire-to-retire': {
    id: 'hire-to-retire',
    name: 'Hire to Retire',
    emoji: '👥',
    tagline: 'From sourcing talent to seamless offboarding — AI-powered',
    timeEstimate: '8 minutes',
    exampleFinding:
      'HR teams typically recover 40+ hrs/week by automating onboarding, payroll processing, and compliance reporting alone.',
    whatYouDiscover: [
      'Recruitment & applicant tracking gaps',
      'Onboarding workflow automation',
      'Performance management processes',
      'Payroll & benefits processing',
      'Offboarding compliance & data handling',
    ],
    stages: [
      { id: 'h2r-1', name: 'Recruitment & Talent Acquisition', description: 'Job requisition approval, job posting, applicant tracking, screening, interviewing, and offer management.' },
      { id: 'h2r-2', name: 'Onboarding', description: 'Pre-hire documentation, IT provisioning, orientation scheduling, training assignments, and compliance sign-offs.' },
      { id: 'h2r-3', name: 'Performance Management', description: 'Goal setting, continuous feedback, mid-year and annual review cycles, and performance improvement plans.' },
      { id: 'h2r-4', name: 'Learning & Development', description: 'Training needs analysis, course enrolment, LMS management, certification tracking, and skills gap analysis.' },
      { id: 'h2r-5', name: 'Compensation & Benefits', description: 'Salary benchmarking, merit review cycles, benefits enrolment, changes management, and total rewards statements.' },
      { id: 'h2r-6', name: 'Payroll Processing', description: 'Payroll calculation, tax withholding, deductions management, payslip generation, and statutory reporting.' },
      { id: 'h2r-7', name: 'Offboarding & Compliance', description: 'Exit interviews, asset retrieval, system access revocation, final payroll processing, and data retention compliance.' },
    ],
  },
};

export const TECH_CATEGORIES = [
  {
    id: 'crm',
    label: 'CRM',
    icon: '🤝',
    options: ['Salesforce', 'HubSpot', 'Microsoft Dynamics CRM', 'Zoho CRM', 'Oracle CX', 'None'],
  },
  {
    id: 'erp',
    label: 'ERP',
    icon: '⚙️',
    options: ['SAP S/4HANA', 'SAP ECC', 'Oracle ERP Cloud', 'Microsoft Dynamics 365 F&O', 'NetSuite', 'None'],
  },
  {
    id: 'integration',
    label: 'Integration',
    icon: '🔗',
    options: ['Boomi', 'MuleSoft', 'Azure Integration Services', 'Informatica', 'Workato', 'None'],
  },
  {
    id: 'data',
    label: 'Data & Analytics',
    icon: '📊',
    options: ['Snowflake', 'Databricks', 'Microsoft Fabric', 'Power BI', 'Tableau', 'None'],
  },
  {
    id: 'hrms',
    label: 'HRMS',
    icon: '👤',
    options: ['Workday', 'SAP SuccessFactors', 'ADP', 'BambooHR', 'UKG', 'None'],
  },
];
