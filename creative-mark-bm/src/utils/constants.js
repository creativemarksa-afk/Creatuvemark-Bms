// Constants file

// Application status configuration
export const APPLICATION_STATUS = {
  submitted: {
    label: 'Submitted',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600'
  },
  under_review: {
    label: 'Under Review',
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-600'
  },
  approved: {
    label: 'Approved',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600'
  },
  in_process: {
    label: 'In Process',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600'
  },
  completed: {
    label: 'Completed',
    color: 'emerald',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200',
    iconColor: 'text-emerald-600'
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600'
  }
};

// Progress percentage mapping
export const STATUS_PROGRESS = {
  submitted: 20,
  under_review: 40,
  approved: 60,
  in_process: 80,
  completed: 100,
  rejected: 0
};

// Service type labels
export const SERVICE_TYPES = {
  commercial: 'Commercial Activity',
  engineering: 'Engineering Consulting Office',
  real_estate: 'Real Estate Development',
  industrial: 'Industrial Activity',
  agricultural: 'Agricultural Activity',
  service: 'Service Activity',
  advertising: 'Advertising Activity'
};

// Partner type labels
export const PARTNER_TYPES = {
  sole: 'Sole Proprietorship',
  withSaudiPartner: 'With Saudi Partner'
};