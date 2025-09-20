import Layout from "./Layout.jsx";

import Home from "./Home";

import Dashboard from "./Dashboard";

import Auth from "./Auth";

import Patients from "./Patients";

import Reports from "./Reports";

import Agenda from "./Agenda";

import NewDoctor from "./NewDoctor";

import Doctors from "./Doctors";

import InviteAccept from "./InviteAccept";

import Clinics from "./Clinics";

import NewClinic from "./NewClinic";

import Developer from "./Developer";

import Registration from "./Registration";

import PasswordReset from "./PasswordReset";

import EmailVerification from "./EmailVerification";

import PendingApprovals from "./PendingApprovals";

import DoctorView from "./DoctorView";

import NewsletterClinica4 from "./NewsletterClinica4";

import InviteReception from "./InviteReception";

import Prontuarios from "./Prontuarios";

import Exams from "./Exams";

import LandingPage from "./LandingPage";

import NewMedicalRecord from "./NewMedicalRecord";

import PatientDetails from "./PatientDetails";

import NewPatient from "./NewPatient";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Dashboard: Dashboard,
    
    Auth: Auth,
    
    Patients: Patients,
    
    Reports: Reports,
    
    Agenda: Agenda,
    
    NewDoctor: NewDoctor,
    
    Doctors: Doctors,
    
    InviteAccept: InviteAccept,
    
    Clinics: Clinics,
    
    NewClinic: NewClinic,
    
    Developer: Developer,
    
    Registration: Registration,
    
    PasswordReset: PasswordReset,
    
    EmailVerification: EmailVerification,
    
    PendingApprovals: PendingApprovals,
    
    DoctorView: DoctorView,
    
    NewsletterClinica4: NewsletterClinica4,
    
    InviteReception: InviteReception,
    
    Prontuarios: Prontuarios,
    
    Exams: Exams,
    
    LandingPage: LandingPage,
    
    NewMedicalRecord: NewMedicalRecord,
    
    PatientDetails: PatientDetails,
    
    NewPatient: NewPatient,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Auth" element={<Auth />} />
                
                <Route path="/Patients" element={<Patients />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/Agenda" element={<Agenda />} />
                
                <Route path="/NewDoctor" element={<NewDoctor />} />
                
                <Route path="/Doctors" element={<Doctors />} />
                
                <Route path="/InviteAccept" element={<InviteAccept />} />
                
                <Route path="/Clinics" element={<Clinics />} />
                
                <Route path="/NewClinic" element={<NewClinic />} />
                
                <Route path="/Developer" element={<Developer />} />
                
                <Route path="/Registration" element={<Registration />} />
                
                <Route path="/reset-password" element={<PasswordReset />} />
                
                <Route path="/email-verification" element={<EmailVerification />} />
                
                <Route path="/PendingApprovals" element={<PendingApprovals />} />
                
                <Route path="/DoctorView" element={<DoctorView />} />
                
                <Route path="/NewsletterClinica4" element={<NewsletterClinica4 />} />
                
                <Route path="/InviteReception" element={<InviteReception />} />
                
                <Route path="/Prontuarios" element={<Prontuarios />} />
                
                <Route path="/Exams" element={<Exams />} />
                
                <Route path="/LandingPage" element={<LandingPage />} />
                
                <Route path="/NewMedicalRecord" element={<NewMedicalRecord />} />
                
                <Route path="/PatientDetails" element={<PatientDetails />} />
                
                <Route path="/NewPatient" element={<NewPatient />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}