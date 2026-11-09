export type ApplicationStatus =
  | 'APPLICATIONDRAFT'
  | 'APPLICATIONSUBMITTED'
  | 'APPLICATIONWAITINGLIST'
  | 'ENROLMENTOFFERED'
  | 'ENROLMENTOFFERACCEPTED'
  | 'AWAITINGPLACEMENT'
  | 'SCHOOLDISCONTINUED'
  | 'APPLICANTDISCONTINUED'
  | 'APPLICATIONSUCCESSFUL'

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  APPLICATIONDRAFT: 'Application Drafts',
  APPLICATIONSUBMITTED: 'Submitted',
  APPLICATIONWAITINGLIST: 'Waiting List',
  ENROLMENTOFFERED: 'Offered',
  ENROLMENTOFFERACCEPTED: 'Offer Accepted',
  AWAITINGPLACEMENT: 'Awaiting Placement',
  SCHOOLDISCONTINUED: 'Unsuccessful',
  APPLICANTDISCONTINUED: 'Discontinued',
  APPLICATIONSUCCESSFUL: 'Enrolled',
}

export const STATUS_COLOR: Record<
  ApplicationStatus,
  { bg: string; fg: string; border: string }
> = {
  APPLICATIONDRAFT: { bg: '#E8E8E8', fg: '#4A4A4A', border: '#C8C8C8' },
  APPLICATIONSUBMITTED: { bg: '#D6EEF2', fg: '#0A6E7A', border: '#0A6E7A' },
  APPLICATIONWAITINGLIST: { bg: '#FFE8CC', fg: '#A85A00', border: '#F5A623' },
  ENROLMENTOFFERED: { bg: '#D6ECFF', fg: '#0B5CAD', border: '#2B9CDB' },
  ENROLMENTOFFERACCEPTED: { bg: '#D8F3E4', fg: '#1B7A45', border: '#2EAA5F' },
  AWAITINGPLACEMENT: { bg: '#FFE0CC', fg: '#B34A00', border: '#FF7A2F' },
  SCHOOLDISCONTINUED: { bg: '#3A3A3A', fg: '#FFFFFF', border: '#3A3A3A' },
  APPLICANTDISCONTINUED: { bg: '#E8E8E8', fg: '#4A4A4A', border: '#9A9A9A' },
  APPLICATIONSUCCESSFUL: { bg: '#2C2C2C', fg: '#FFFFFF', border: '#2C2C2C' },
}

export interface StaffProfile {
  id: string
  applicantId: string
  firstName: string
  lastName: string
  status: ApplicationStatus
  percentageComplete: number
  term: string
  schoolName: string
  schoolLocation: string
  year: string
}

export interface ParentStudent {
  id: string
  firstName: string
  lastName: string
  percentageComplete: number
}

export interface ParentApplication {
  id: string
  year: string
  term: string
  status: ApplicationStatus
  student: { firstName: string; lastName: string; id: string }
  schools: { name: string; suburb: string }[]
  hasOffered: boolean
}

export const SAMPLE_STAFF = {
  preferredName: 'Alex',
  organisationName: 'Dev College',
  brandColor: '#0A6E7A',
  stripeGradientEnd: '#0D9AA8',
  profiles: [
    {
      id: 'app-1',
      applicantId: 'stu-1',
      firstName: 'Maya',
      lastName: 'Chen',
      status: 'APPLICATIONDRAFT',
      percentageComplete: 42,
      term: 'Term 1',
      schoolName: 'Dev College',
      schoolLocation: 'Melbourne',
      year: 'Year 7',
    },
    {
      id: 'app-2',
      applicantId: 'stu-2',
      firstName: 'Jordan',
      lastName: 'Nguyen',
      status: 'APPLICATIONSUBMITTED',
      percentageComplete: 100,
      term: 'Term 1',
      schoolName: 'Dev College',
      schoolLocation: 'Melbourne',
      year: 'Year 8',
    },
    {
      id: 'app-3',
      applicantId: 'stu-3',
      firstName: 'Sam',
      lastName: 'Okafor',
      status: 'ENROLMENTOFFERED',
      percentageComplete: 100,
      term: 'Term 1',
      schoolName: 'Dev College',
      schoolLocation: 'Melbourne',
      year: 'Year 7',
    },
    {
      id: 'app-4',
      applicantId: 'stu-4',
      firstName: 'Priya',
      lastName: 'Patel',
      status: 'APPLICATIONWAITINGLIST',
      percentageComplete: 100,
      term: 'Term 2',
      schoolName: 'Dev College',
      schoolLocation: 'Melbourne',
      year: 'Year 9',
    },
    {
      id: 'app-5',
      applicantId: 'stu-5',
      firstName: 'Leo',
      lastName: 'Martinez',
      status: 'ENROLMENTOFFERACCEPTED',
      percentageComplete: 100,
      term: 'Term 1',
      schoolName: 'Dev College',
      schoolLocation: 'Melbourne',
      year: 'Prep',
    },
  ] satisfies StaffProfile[],
}

export const SAMPLE_PARENT = {
  preferredName: 'Taylor',
  students: [
    {
      id: 'stu-p1',
      firstName: 'Avery',
      lastName: 'Brooks',
      percentageComplete: 100,
    },
    {
      id: 'stu-p2',
      firstName: 'Riley',
      lastName: 'Brooks',
      percentageComplete: 65,
    },
  ] satisfies ParentStudent[],
  applications: [
    {
      id: 'p-app-1',
      year: 'Year 7',
      term: 'Term 1',
      status: 'APPLICATIONSUBMITTED',
      student: { firstName: 'Avery', lastName: 'Brooks', id: 'stu-p1' },
      schools: [
        { name: 'Dev College', suburb: 'Melbourne' },
        { name: 'Northside High', suburb: 'Brunswick' },
      ],
      hasOffered: false,
    },
    {
      id: 'p-app-2',
      year: 'Year 5',
      term: 'Term 1',
      status: 'ENROLMENTOFFERED',
      student: { firstName: 'Riley', lastName: 'Brooks', id: 'stu-p2' },
      schools: [{ name: 'Dev College', suburb: 'Melbourne' }],
      hasOffered: true,
    },
  ] satisfies ParentApplication[],
}
