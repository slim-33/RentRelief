// BC Residential Tenancy Act compliant and problematic clause patterns

export interface ClausePattern {
  id: string;
  category: 'security_deposit' | 'rent' | 'termination' | 'maintenance' | 'privacy' | 'pets' | 'subletting' | 'utilities' | 'other';
  name: string;
  description: string;
  keywords: string[];
  isMalicious: boolean;
  severity: 'low' | 'medium' | 'high';
  legalReference?: string;
  explanation: string;
}

export const bcRentalClauses: ClausePattern[] = [
  // Security Deposit Issues
  {
    id: 'excessive-deposit',
    category: 'security_deposit',
    name: 'Excessive Security Deposit',
    description: 'Deposit exceeding half month\'s rent',
    keywords: ['first and last', 'two months', '1.5 months', 'one and a half months', 'double deposit'],
    isMalicious: true,
    severity: 'high',
    legalReference: 'BC RTA Section 19',
    explanation: 'In BC, landlords can only collect a security deposit equal to half a month\'s rent. Any amount exceeding this is illegal.'
  },
  {
    id: 'non-refundable-deposit',
    category: 'security_deposit',
    name: 'Non-Refundable Deposit',
    description: 'Deposit marked as non-refundable',
    keywords: ['non-refundable', 'non refundable', 'will not be returned', 'forfeited'],
    isMalicious: true,
    severity: 'high',
    legalReference: 'BC RTA Section 38',
    explanation: 'Security deposits must be refundable. Landlords cannot keep deposits without proper justification and documentation.'
  },
  {
    id: 'pet-deposit-excessive',
    category: 'security_deposit',
    name: 'Excessive Pet Deposit',
    description: 'Pet deposit exceeding half month\'s rent',
    keywords: ['pet deposit', 'pet damage deposit', 'animal deposit'],
    isMalicious: true,
    severity: 'medium',
    legalReference: 'BC RTA Section 19',
    explanation: 'Pet deposits in BC are also limited to half a month\'s rent, separate from the security deposit.'
  },
  
  // Rent Issues
  {
    id: 'illegal-rent-increase',
    category: 'rent',
    name: 'Unauthorized Rent Increase',
    description: 'Rent increase exceeding legal limits or without proper notice',
    keywords: ['rent increase', 'increase rent', 'raise rent', 'new rent amount'],
    isMalicious: true,
    severity: 'high',
    legalReference: 'BC RTA Section 42',
    explanation: 'Landlords can only increase rent once per year with 3 months notice, and only by the amount set by the BC government.'
  },
  {
    id: 'late-fees-excessive',
    category: 'rent',
    name: 'Excessive Late Fees',
    description: 'Late fees that may be unenforceable',
    keywords: ['late fee', 'late payment', 'penalty', 'interest on late'],
    isMalicious: true,
    severity: 'medium',
    legalReference: 'BC RTA',
    explanation: 'While landlords can charge reasonable late fees, excessive penalties may not be enforceable under BC law.'
  },
  {
    id: 'post-dated-cheques',
    category: 'rent',
    name: 'Required Post-Dated Cheques',
    description: 'Requirement to provide post-dated cheques',
    keywords: ['post-dated', 'postdated', 'cheques in advance', 'year of cheques'],
    isMalicious: true,
    severity: 'low',
    legalReference: 'BC RTA Section 22',
    explanation: 'Landlords cannot require tenants to provide post-dated cheques or automatic payment authorization.'
  },
  
  // Termination Issues
  {
    id: 'illegal-eviction-clause',
    category: 'termination',
    name: 'Illegal Eviction Terms',
    description: 'Terms allowing eviction without proper process',
    keywords: ['immediate eviction', 'evict without notice', 'terminate immediately', 'vacate within 24'],
    isMalicious: true,
    severity: 'high',
    legalReference: 'BC RTA Section 45-55',
    explanation: 'Landlords must follow proper eviction procedures. Clauses allowing immediate eviction are unenforceable.'
  },
  {
    id: 'waiving-notice-period',
    category: 'termination',
    name: 'Waived Notice Period',
    description: 'Tenant waiving right to proper notice',
    keywords: ['waive notice', 'no notice required', 'forfeit notice period'],
    isMalicious: true,
    severity: 'high',
    legalReference: 'BC RTA Section 45',
    explanation: 'Tenants cannot waive their right to proper notice periods as defined by the RTA.'
  },
  {
    id: 'fixed-term-vacate',
    category: 'termination',
    name: 'Fixed Term Vacate Clause',
    description: 'Requiring tenant to move at end of fixed term',
    keywords: ['must vacate', 'vacate clause', 'move out at end', 'fixed term ending'],
    isMalicious: true,
    severity: 'high',
    legalReference: 'BC RTA Section 44',
    explanation: 'As of 2017, vacate clauses in fixed-term leases are no longer enforceable in BC unless specific conditions are met.'
  },
  
  // Maintenance Issues
  {
    id: 'tenant-major-repairs',
    category: 'maintenance',
    name: 'Tenant Responsible for Major Repairs',
    description: 'Making tenant responsible for structural repairs',
    keywords: ['tenant responsible for repairs', 'all repairs', 'maintain at own expense', 'fix at tenant cost'],
    isMalicious: true,
    severity: 'high',
    legalReference: 'BC RTA Section 32',
    explanation: 'Landlords are responsible for maintaining the rental unit. Clauses shifting major repair responsibilities to tenants may be unenforceable.'
  },
  
  // Privacy Issues
  {
    id: 'unrestricted-entry',
    category: 'privacy',
    name: 'Unrestricted Landlord Entry',
    description: 'Allowing landlord entry without proper notice',
    keywords: ['enter at any time', 'access without notice', 'right to inspect', 'enter without permission'],
    isMalicious: true,
    severity: 'high',
    legalReference: 'BC RTA Section 29',
    explanation: 'Landlords must give 24 hours written notice before entering, except in emergencies. Clauses allowing unlimited access are illegal.'
  },
  
  // Pet Restrictions
  {
    id: 'no-pets-strata',
    category: 'pets',
    name: 'No Pets Clause (Strata)',
    description: 'Pet restriction in strata properties',
    keywords: ['no pets', 'pets not allowed', 'pet free', 'no animals'],
    isMalicious: false,
    severity: 'low',
    legalReference: 'BC Strata Property Act',
    explanation: 'In strata properties, no-pet rules may be enforceable if part of strata bylaws. In non-strata rentals, landlords generally cannot prohibit pets.'
  },
  
  // Subletting
  {
    id: 'no-subletting',
    category: 'subletting',
    name: 'Subletting Restrictions',
    description: 'Prohibition on subletting or assignment',
    keywords: ['no subletting', 'cannot sublet', 'no assignment', 'cannot assign'],
    isMalicious: false,
    severity: 'low',
    legalReference: 'BC RTA Section 34',
    explanation: 'While landlords can restrict subletting, they cannot unreasonably refuse. This is important for students who may need to sublet during summer.'
  },
  
  // Utilities
  {
    id: 'utility-responsibility',
    category: 'utilities',
    name: 'Utility Responsibilities',
    description: 'Unclear utility payment terms',
    keywords: ['utilities included', 'tenant pays utilities', 'hydro', 'electricity', 'gas', 'water'],
    isMalicious: false,
    severity: 'low',
    explanation: 'Make sure you understand which utilities you are responsible for. This should be clearly stated in the lease.'
  },
  
  // Standard Terms (Not Malicious)
  {
    id: 'standard-notice',
    category: 'termination',
    name: 'Standard Notice Period',
    description: 'One month notice requirement',
    keywords: ['one month notice', '30 days notice', 'notice to end tenancy'],
    isMalicious: false,
    severity: 'low',
    legalReference: 'BC RTA Section 45',
    explanation: 'Standard notice period for month-to-month tenancies is one month. This is a normal clause.'
  },
  {
    id: 'condition-inspection',
    category: 'maintenance',
    name: 'Move-in/Move-out Inspection',
    description: 'Requirement for condition inspection',
    keywords: ['condition inspection', 'move-in inspection', 'move-out inspection', 'inspection report'],
    isMalicious: false,
    severity: 'low',
    legalReference: 'BC RTA Section 23',
    explanation: 'Condition inspections are required by law and protect both landlord and tenant. Make sure to complete these.'
  },
  {
    id: 'guest-restrictions',
    category: 'other',
    name: 'Excessive Guest Restrictions',
    description: 'Unreasonable limits on having guests',
    keywords: ['no overnight guests', 'guest limit', 'visitors must', 'register guests'],
    isMalicious: true,
    severity: 'medium',
    explanation: 'While landlords can set reasonable rules, overly restrictive guest policies may infringe on your right to quiet enjoyment.'
  },
  {
    id: 'waiving-rights',
    category: 'other',
    name: 'Waiving Tenant Rights',
    description: 'Clauses attempting to waive RTA protections',
    keywords: ['waive rights', 'give up rights', 'not covered by', 'exempt from'],
    isMalicious: true,
    severity: 'high',
    legalReference: 'BC RTA Section 5',
    explanation: 'Any clause that attempts to waive your rights under the Residential Tenancy Act is void and unenforceable.'
  }
];

export const categoryLabels: Record<ClausePattern['category'], string> = {
  security_deposit: 'Security Deposit',
  rent: 'Rent & Payments',
  termination: 'Termination & Eviction',
  maintenance: 'Maintenance & Repairs',
  privacy: 'Privacy & Access',
  pets: 'Pets',
  subletting: 'Subletting',
  utilities: 'Utilities',
  other: 'Other Terms'
};

export const severityColors: Record<ClausePattern['severity'], string> = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};
