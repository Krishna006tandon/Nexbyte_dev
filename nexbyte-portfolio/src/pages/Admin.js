import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Admin.css';
import Sidebar from '../components/Sidebar';
import { SrsContext } from '../context/SrsContext';
import TaskGenerator from '../components/TaskGenerator';
import TaskList from '../components/TaskList';
import ProjectTracker from '../components/ProjectTracker';
import ProjectTaskManagement from '../components/ProjectTaskManagement';
import TaskMonitoringDashboard from '../components/TaskMonitoringDashboard';
import InternshipDashboard from './InternshipDashboard';
import ApplicationList from './ApplicationList';
import ApplicationDetail from './ApplicationDetail';
import EmailAutomation from './EmailAutomation';
import RoleManagement from './RoleManagement';
import Modal from '../components/Modal';
import CertificateAdminPanel from '../components/CertificateAdminPanel';

const Admin = () => {
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bills, setBills] = useState([]);
  const [resources, setResources] = useState([]);
  const [resourceInterns, setResourceInterns] = useState([]);
  const [presentationTopics, setPresentationTopics] = useState([]);
  const [groupMeetings, setGroupMeetings] = useState([]);
  const [aboutTeamMembers, setAboutTeamMembers] = useState([]);
  const [aboutTeamLoading, setAboutTeamLoading] = useState(false);
  const [aboutTeamError, setAboutTeamError] = useState('');
  const [aboutTeamForm, setAboutTeamForm] = useState({
    name: '',
    role: '',
    imageUrl: '',
    bio: '',
    github: '',
    linkedin: '',
    order: 0,
    isActive: true,
  });
  const [aboutTeamImageFile, setAboutTeamImageFile] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [internType, setInternType] = useState('free');
  const [internshipStartDate, setInternshipStartDate] = useState('');
  const [internshipEndDate, setInternshipEndDate] = useState('');
  const [acceptanceDate, setAcceptanceDate] = useState('');
  const [clientPasswords, setClientPasswords] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [taskPageClientId, setTaskPageClientId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClientForTracker, setSelectedClientForTracker] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [showInternReport, setShowInternReport] = useState(false);
  const [selectedInternForReport, setSelectedInternForReport] = useState(null);
  const [internReport, setInternReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [expandedBill, setExpandedBill] = useState(null);
  const [showProjectTaskManagement, setShowProjectTaskManagement] = useState(false);
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState(null);
  const [paymentReminderSendingTo, setPaymentReminderSendingTo] = useState(null);
  const [paymentStatusUpdatingFor, setPaymentStatusUpdatingFor] = useState(null);
  const [paymentReferenceByInternId, setPaymentReferenceByInternId] = useState({});
  const [internOfWeekCurrent, setInternOfWeekCurrent] = useState(null);
  const [internOfWeekCountByInternId, setInternOfWeekCountByInternId] = useState({});
  const [internOfWeekUpdatingFor, setInternOfWeekUpdatingFor] = useState(null);
  const [microProjects, setMicroProjects] = useState([]);
  const [microProjectForm, setMicroProjectForm] = useState({ title: '', details: '', assignedInternIds: [] });
  const [microProjectLoading, setMicroProjectLoading] = useState(false);
  const [microProjectSubmitting, setMicroProjectSubmitting] = useState(false);
  const activeTrackerMilestone = milestone || selectedClientForTracker?.milestone;
  const formatMeetingDate = (value) =>
    new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  const formatMeetingTime = (value) =>
    new Date(value).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatPaymentStatus = (member) => {
    if (member?.role !== 'intern') return 'N/A';
    return member?.internFeeStatus === 'paid' ? 'Paid' : 'Unpaid';
  };

  const refreshMembers = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/users', { headers: { 'x-auth-token': token } });
    const data = await res.json();
    if (res.ok) setMembers(data);
  };

  const refreshInternOfWeek = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'x-auth-token': token };

    const [currentRes, statsRes] = await Promise.all([
      fetch('/api/intern-of-week/current', { headers }),
      fetch('/api/admin/intern-of-week/stats', { headers }),
    ]);

    const currentData = await currentRes.json().catch(() => ({}));
    const statsData = await statsRes.json().catch(() => ({}));

    if (currentRes.ok) setInternOfWeekCurrent(currentData?.internOfWeek || null);
    if (statsRes.ok) {
      const map = {};
      (statsData?.stats || []).forEach((row) => {
        const id = row?.intern?._id;
        if (id) map[id] = row?.selections || 0;
      });
      setInternOfWeekCountByInternId(map);
    }
  };

  const handleSetInternOfWeek = async (internId) => {
    const token = localStorage.getItem('token');
    setInternOfWeekUpdatingFor(internId);
    try {
      const res = await fetch('/api/admin/intern-of-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ internId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to set Intern of the Week');
      setSuccessMessage('Intern of the Week updated');
      await refreshInternOfWeek();
    } catch (e) {
      setErrorMessage(e.message);
    } finally {
      setInternOfWeekUpdatingFor(null);
    }
  };

  const handleClearInternOfWeek = async () => {
    const token = localStorage.getItem('token');
    setInternOfWeekUpdatingFor('CLEAR');
    try {
      const res = await fetch('/api/admin/intern-of-week', {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to clear Intern of the Week');
      setSuccessMessage('Intern of the Week cleared');
      await refreshInternOfWeek();
    } catch (e) {
      setErrorMessage(e.message);
    } finally {
      setInternOfWeekUpdatingFor(null);
    }
  };

  const refreshMicroProjects = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/microprojects', { headers: { 'x-auth-token': token } });
    const data = await res.json().catch(() => []);
    if (res.ok) setMicroProjects(Array.isArray(data) ? data : []);
  };

  const handleMicroProjectInternToggle = (internId) => {
    setMicroProjectForm((prev) => {
      const exists = prev.assignedInternIds.includes(internId);
      return {
        ...prev,
        assignedInternIds: exists
          ? prev.assignedInternIds.filter((id) => id !== internId)
          : [...prev.assignedInternIds, internId],
      };
    });
  };

  const handleCreateMicroProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setMicroProjectSubmitting(true);
    try {
      const res = await fetch('/api/admin/microprojects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(microProjectForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to create microproject');
      setSuccessMessage('Microproject created');
      setMicroProjectForm({ title: '', details: '', assignedInternIds: [] });
      await refreshMicroProjects();
    } catch (e2) {
      setErrorMessage(e2.message);
    } finally {
      setMicroProjectSubmitting(false);
    }
  };

  const handleDeleteMicroProject = async (id) => {
    const ok = window.confirm('Delete this microproject?');
    if (!ok) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/microprojects/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to delete microproject');
      setSuccessMessage('Microproject deleted');
      await refreshMicroProjects();
    } catch (e2) {
      setErrorMessage(e2.message);
    }
  };

  const fetchAboutTeamMembers = async () => {
    setAboutTeamLoading(true);
    setAboutTeamError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/team-members', {
        headers: { 'x-auth-token': token },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || 'Failed to load team members');
      setAboutTeamMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      setAboutTeamError(e.message);
    } finally {
      setAboutTeamLoading(false);
    }
  };

  const handleAboutTeamFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAboutTeamForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAboutTeamImageChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setAboutTeamImageFile(file);
  };

  const handleAddAboutTeamMember = async (e) => {
    e.preventDefault();
    setAboutTeamError('');
    try {
      const token = localStorage.getItem('token');
      let uploadedImageUrl = '';
      if (aboutTeamImageFile) {
        const form = new FormData();
        form.append('image', aboutTeamImageFile);
        const upRes = await fetch('/api/admin/team-members/upload-image', {
          method: 'POST',
          headers: { 'x-auth-token': token },
          body: form,
        });
        const upData = await upRes.json().catch(() => ({}));
        if (!upRes.ok) throw new Error(upData?.message || 'Failed to upload image');
        uploadedImageUrl = upData.url || '';
      }

      const payload = {
        ...aboutTeamForm,
        imageUrl: uploadedImageUrl || aboutTeamForm.imageUrl,
        order: Number(aboutTeamForm.order) || 0,
      };
      const res = await fetch('/api/admin/team-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to add team member');
      setAboutTeamForm({
        name: '',
        role: '',
        imageUrl: '',
        bio: '',
        github: '',
        linkedin: '',
        order: 0,
        isActive: true,
      });
      setAboutTeamImageFile(null);
      await fetchAboutTeamMembers();
      setSuccessMessage('Team member added');
    } catch (e2) {
      setAboutTeamError(e2.message);
    }
  };

  const handleDeleteAboutTeamMember = async (id) => {
    if (!window.confirm('Delete this team member?')) return;
    setAboutTeamError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/team-members/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to delete team member');
      await fetchAboutTeamMembers();
      setSuccessMessage('Team member deleted');
    } catch (e) {
      setAboutTeamError(e.message);
    }
  };

  const handleToggleAboutTeamActive = async (member) => {
    setAboutTeamError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/team-members/${member._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ isActive: !member.isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to update team member');
      await fetchAboutTeamMembers();
    } catch (e) {
      setAboutTeamError(e.message);
    }
  };

  const location = useLocation();
  const navigate = useNavigate();
  const { setSrsFullData } = useContext(SrsContext);

  // Check if we have navigation state from TaskGenerator
  useEffect(() => {
    console.log('Checking navigation state:', location.state); // Debug log
    console.log('Available projects:', projects); // Debug log
    if (location.state?.fromTaskGenerator && location.state?.selectedProjectId) {
      // Find the project and set it for task management
      const project = projects.find(p => p._id === location.state.selectedProjectId);
      console.log('Found project:', project); // Debug log
      if (project) {
        setSelectedProjectForTasks(project);
        setShowProjectTaskManagement(true);
        console.log('Set project for task management'); // Debug log
      }
      // Clear the state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, projects, navigate, location.pathname]);

  useEffect(() => {
    if (location.pathname === '/admin/about-us') {
      fetchAboutTeamMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const [clientData, setClientData] = useState({
    clientName: '',
    contactPerson: '',
    email: '',
    phone: '',
    companyAddress: '',
    projectName: '',
    projectType: '',
    projectRequirements: '',
    projectDeadline: '',
    totalBudget: '',
    billingAddress: '',
    gstNumber: '',
    paymentTerms: '',
    paymentMethod: '',
    domainRegistrarLogin: '',
    webHostingLogin: '',
    logoAndBrandingFiles: '',
    content: '',
  });

  const [billData, setBillData] = useState({
    client: '',
    project: '',
    amount: '',
    dueDate: '',
    description: '',
    status: 'Unpaid',
  });
  const [billInvoiceFile, setBillInvoiceFile] = useState(null);

  const [projectData, setProjectData] = useState({
    projectName: '',
    projectType: '',
    projectDescription: '',
    totalBudget: '',
    projectDeadline: '',
    clientType: 'non-client',
    associatedClient: '',
  });

  const [resourceData, setResourceData] = useState({
    title: '',
    description: '',
    url: '',
    type: 'documentation',
    category: 'general',
    difficulty: 'beginner',
    tags: '',
    assignmentMode: 'all',
    assignedInterns: [],
    document: '',
  });

  const [resourceDocumentFile, setResourceDocumentFile] = useState(null);

  const [presentationTopicData, setPresentationTopicData] = useState({
    internId: '',
    title: '',
    description: '',
    dueDate: '',
  });

  const [groupMeetingData, setGroupMeetingData] = useState({
    title: '',
    description: '',
    meetLink: '',
    scheduledAt: '',
    durationMinutes: 60,
    audience: 'all',
    invitedInterns: [],
  });

  const [localSrsData, setLocalSrsData] = useState({
    projectName: '',
    projectDescription: '',
    projectRequirements: '',
    targetAudience: '',
    functionalRequirements: '',
    nonFunctionalRequirements: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      try {
        if (location.pathname === '/admin/contacts') {
          const res = await fetch('/api/contacts', { headers });
          const data = await res.json();
          if (res.ok) {
            setContacts(data);
          } else {
            console.error(data.message);
          }
        } else if (location.pathname === '/admin/messages') {
          const res = await fetch('/api/messages', { headers });
          const data = await res.json();
          if (res.ok) {
            setMessages(data);
          } else {
            console.error(data.message);
          }
        } else if (location.pathname === '/admin/members') {
          const [usersRes] = await Promise.all([fetch('/api/users', { headers })]);
          const usersData = await usersRes.json();
          if (usersRes.ok) {
            setMembers(usersData);
          } else {
            console.error(usersData.message);
          }
          await refreshInternOfWeek();
        } else if (location.pathname === '/admin/reports') {
          const res = await fetch('/api/users', { headers });
          const data = await res.json();
          if (res.ok) {
            setMembers(data);
          } else {
            console.error(data.message);
          }
        } else if (['/admin/clients', '/admin/srs-generator', '/admin/billing', '/admin/tasks', '/admin/projects', '/admin/task-management'].includes(location.pathname)) {
          const res = await fetch('/api/clients', { headers });
          const data = await res.json();
          if (res.ok) {
            setClients(data);
          } else {
            console.error(data.message);
          }
        } else if (location.pathname === '/admin/resources') {
          const [resourceRes, usersRes] = await Promise.all([
            fetch('/api/resources', { headers }),
            fetch('/api/users', { headers })
          ]);
          const resourceData = await resourceRes.json();
          const usersData = await usersRes.json();
          if (resourceRes.ok) {
            setResources(resourceData);
          } else {
            console.error(resourceData.message);
          }
          if (usersRes.ok) {
            setResourceInterns(usersData.filter((member) => member.role === 'intern'));
          } else {
            console.error(usersData.message);
          }
        } else if (location.pathname === '/admin/group-meetings') {
          const [meetingsRes, usersRes] = await Promise.all([
            fetch('/api/group-meetings', { headers }),
            fetch('/api/users', { headers })
          ]);
          const meetingsData = await meetingsRes.json();
          const usersData = await usersRes.json();
          if (meetingsRes.ok) {
            setGroupMeetings(meetingsData);
          } else {
            console.error(meetingsData.message);
          }
          if (usersRes.ok) {
            setResourceInterns(usersData.filter((member) => member.role === 'intern'));
          } else {
            console.error(usersData.message);
          }
        } else if (location.pathname === '/admin/presentation-topics') {
          const [topicsRes, usersRes] = await Promise.all([
            fetch('/api/presentation-topics', { headers }),
            fetch('/api/users', { headers })
          ]);
          const topicsData = await topicsRes.json();
          const usersData = await usersRes.json();
          if (topicsRes.ok) {
            setPresentationTopics(topicsData);
          } else {
            console.error(topicsData.message);
          }
          if (usersRes.ok) {
            setMembers(usersData);
          } else {
            console.error(usersData.message);
          }
        } else if (location.pathname === '/admin/microprojects') {
          setMicroProjectLoading(true);
          const [usersRes, microRes] = await Promise.all([
            fetch('/api/users', { headers }),
            fetch('/api/admin/microprojects', { headers }),
          ]);
          const usersData = await usersRes.json().catch(() => []);
          const microData = await microRes.json().catch(() => []);
          if (usersRes.ok) {
            setResourceInterns((Array.isArray(usersData) ? usersData : []).filter((member) => member.role === 'intern'));
          } else {
            console.error(usersData.message);
          }
          if (microRes.ok) {
            setMicroProjects(Array.isArray(microData) ? microData : []);
          } else {
            console.error(microData.message);
          }
          setMicroProjectLoading(false);
        }

        if (['/admin/projects', '/admin/task-management', '/admin/billing'].includes(location.pathname)) {
          const res = await fetch('/api/projects', { headers });
          const data = await res.json();
          if (res.ok) {
            setProjects(data);
          } else {
            console.error(data.message);
          }
        }

        if (location.pathname === '/admin/billing') {
          const res = await fetch('/api/bills', { headers });
          const data = await res.json();
          if (res.ok) {
            setBills(data);
          } else {
            console.error(data.message);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [location.pathname]);

  const handleTasksSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ 
          email, 
          password, 
          role, 
          internType: role === 'intern' ? internType : undefined, 
          internshipStartDate: role === 'intern' ? internshipStartDate : undefined, 
          internshipEndDate: role === 'intern' ? internshipEndDate : undefined, 
          acceptanceDate: role === 'intern' ? acceptanceDate : undefined 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Clear form
        setEmail('');
        setPassword('');
        setInternType('free');
        setInternshipStartDate('');
        setInternshipEndDate('');
        setAcceptanceDate('');
        
        // Show success message (might include warning about email)
        setSuccessMessage(data.message);
        if (data.warning) {
          console.warn('Email warning:', data.warning);
        }

        // Refresh members list from server to get proper user objects
        const fetchRes = await fetch('/api/users', {
          headers: { 'x-auth-token': token },
        });
        const updatedMembers = await fetchRes.json();
        if (fetchRes.ok) {
          setMembers(updatedMembers);
        }
        setTimeout(() => setSuccessMessage(''), 8000);
      } else {
        setErrorMessage(data.message || 'Failed to add member');
        console.error(data.message);
      }
    } catch (err) {
      setErrorMessage('Server connection error. Please try again.');
      console.error(err);
    }
  };

  const handleDeleteMember = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setMembers(members.filter((member) => member._id !== id));
      }
      else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendInternPaymentReminder = async (internId) => {
    const token = localStorage.getItem('token');
    try {
      setPaymentReminderSendingTo(internId);
      setSuccessMessage('');
      setErrorMessage('');

      const res = await fetch(`/api/users/${internId}/send-intern-payment-reminder`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || 'Reminder email sent');
        setTimeout(() => setSuccessMessage(''), 8000);
      } else {
        setErrorMessage(data.message || 'Failed to send reminder email');
        setTimeout(() => setErrorMessage(''), 8000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to send reminder email');
      setTimeout(() => setErrorMessage(''), 8000);
    } finally {
      setPaymentReminderSendingTo(null);
    }
  };

  const handleUpdateInternPaymentStatus = async (internId, nextStatus) => {
    const token = localStorage.getItem('token');
    try {
      setPaymentStatusUpdatingFor(internId);
      setSuccessMessage('');
      setErrorMessage('');

      const reference = paymentReferenceByInternId[internId] || '';
      const res = await fetch(`/api/users/${internId}/intern-payment`, {
        method: 'PATCH',
        headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, reference }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshMembers();
        setSuccessMessage(`Payment marked as ${nextStatus}`);
        setTimeout(() => setSuccessMessage(''), 8000);
      } else {
        setErrorMessage(data.message || 'Failed to update payment status');
        setTimeout(() => setErrorMessage(''), 8000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to update payment status');
      setTimeout(() => setErrorMessage(''), 8000);
    } finally {
      setPaymentStatusUpdatingFor(null);
    }
  };


  const handleAddClient = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(clientData),
      });
      const data = await res.json();
      if (res.ok) {
        setClients([...clients, data]);
        setClientData({
          clientName: '',
          contactPerson: '',
          email: '',
          phone: '',
          companyAddress: '',
          projectName: '',
          projectType: '',
          projectRequirements: '',
          projectDeadline: '',
          totalBudget: '',
          billingAddress: '',
          gstNumber: '',
          paymentTerms: '',
          paymentMethod: '',
          domainRegistrarLogin: '',
          webHostingLogin: '',
          logoAndBrandingFiles: '',
          content: '',
        });
        const fetchRes = await fetch('/api/clients', {
          headers: { 'x-auth-token': token },
        });
        const updatedClients = await fetchRes.json();
        if (fetchRes.ok) {
          setClients(updatedClients);
        }
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClient = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setClients(clients.filter((client) => client._id !== id));
      }
      else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowPassword = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/clients/${id}/password`, {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setClientPasswords({ ...clientPasswords, [id]: data.password });
      }
      else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClientChange = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

  const handleProjectChange = (e) => {
    setProjectData({ ...projectData, [e.target.name]: e.target.value });
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(projectData),
      });
      const data = await res.json();
      if (res.ok) {
        setProjects([...projects, data]);
        setProjectData({
          projectName: '',
          projectType: '',
          projectDescription: '',
          totalBudget: '',
          projectDeadline: '',
          clientType: 'non-client',
          associatedClient: '',
        });
        const fetchRes = await fetch('/api/projects', {
          headers: { 'x-auth-token': token },
        });
        const updatedProjects = await fetchRes.json();
        if (fetchRes.ok) {
          setProjects(updatedProjects);
          setSuccessMessage('Project added successfully!');
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(projects.filter((project) => project._id !== id));
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBillChange = (e) => {
    setBillData({ ...billData, [e.target.name]: e.target.value });
  };

  const handleResourceChange = (e) => {
    setResourceData({ ...resourceData, [e.target.name]: e.target.value });
  };

  const handleResourceDocumentChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (file) {
      const maxSize = 4 * 1024 * 1024; // 4MB limit for Vercel
      if (file.size > maxSize) {
        alert('File size must be less than 4MB');
        e.target.value = '';
        setResourceDocumentFile(null);
        return;
      }
    }
    setResourceDocumentFile(file);
  };

  const handleResourceInternToggle = (internId) => {
    setResourceData((current) => {
      const alreadySelected = current.assignedInterns.includes(internId);
      return {
        ...current,
        assignedInterns: alreadySelected
          ? current.assignedInterns.filter((id) => id !== internId)
          : [...current.assignedInterns, internId],
      };
    });
  };

  const handlePresentationTopicChange = (e) => {
    setPresentationTopicData({ ...presentationTopicData, [e.target.name]: e.target.value });
  };

  const handleGroupMeetingChange = (e) => {
    setGroupMeetingData({ ...groupMeetingData, [e.target.name]: e.target.value });
  };

  const handleGroupMeetingInternToggle = (internId) => {
    setGroupMeetingData((current) => {
      const alreadySelected = current.invitedInterns.includes(internId);
      return {
        ...current,
        invitedInterns: alreadySelected
          ? current.invitedInterns.filter((id) => id !== internId)
          : [...current.invitedInterns, internId],
      };
    });
  };

  const handleGenerateBillDescription = async () => {
    if (!billData.client || !billData.amount) {
      alert('Please select a client and enter an amount first.');
      return;
    }

    const selectedClient = clients.find(c => c._id === billData.client);
    if (!selectedClient) {
      alert('Selected client not found.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Find the last bill for the client
      const clientBills = bills.filter(b => b.client._id === billData.client);
      const lastBill = clientBills.length > 0
        ? clientBills.reduce((latest, current) => new Date(latest.billDate) > new Date(current.billDate) ? latest : current)
        : null;
      const lastBillDate = lastBill ? new Date(lastBill.billDate) : null;

      // Fetch tasks for the client
      const tasksRes = await fetch(`/api/tasks?clientId=${billData.client}`, {
        headers: { 'x-auth-token': token },
      });
      if (!tasksRes.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const tasks = await tasksRes.json();

      // Filter completed tasks since the last bill
      const completedTasks = tasks.filter(task => {
        if (task.status !== 'Done' || !task.completedAt) {
          return false;
        }
        if (lastBillDate) {
          return new Date(task.completedAt) > lastBillDate;
        }
        return true; // Include all completed tasks if no previous bill
      });

      const completedTaskTitles = completedTasks.map(task => task.task_title);

      const res = await fetch('/api/generate-bill-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          clientName: selectedClient.clientName,
          projectName: selectedClient.projectName,
          amount: billData.amount,
          tasks: completedTaskTitles,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate description');
      }

      const { description } = await res.json();
      setBillData({ ...billData, description });
    } catch (err) {
      console.error(err);
      alert(`Failed to generate description. ${err.message}`);
    }
  };

  const handleAddBill = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('client', billData.client);
      if (billData.project) formData.append('project', billData.project);
      formData.append('amount', billData.amount);
      formData.append('dueDate', billData.dueDate);
      if (billData.description) formData.append('description', billData.description);
      formData.append('status', billData.status);
      if (billInvoiceFile) {
        formData.append('invoiceFile', billInvoiceFile);
      }

      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setBills([...bills, data]);
        setBillData({
          client: '',
          project: '',
          amount: '',
          dueDate: '',
          description: '',
          status: 'Unpaid',
        });
        setBillInvoiceFile(null);
        const fetchRes = await fetch('/api/bills', {
          headers: { 'x-auth-token': token },
        });
        const updatedBills = await fetchRes.json();
        if (fetchRes.ok) {
          setBills(updatedBills);
        }
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setSuccessMessage('');
    setErrorMessage('');

    try {
      let documentUrl = '';
      
      // Upload document if a file is selected
      if (resourceDocumentFile) {
        const formData = new FormData();
        formData.append('document', resourceDocumentFile);
        
        const uploadRes = await fetch('/api/resources/upload-document', {
          method: 'POST',
          headers: {
            'x-auth-token': token,
          },
          body: formData,
        });
        
        if (!uploadRes.ok) {
          let errorMessage = 'Failed to upload document';
          try {
            const uploadData = await uploadRes.json();
            errorMessage = uploadData.message || errorMessage;
          } catch (e) {
            errorMessage = uploadRes.statusText || errorMessage;
          }
          setErrorMessage(errorMessage);
          return;
        }
        
        const uploadData = await uploadRes.json();
        documentUrl = uploadData.url;
      }

      const resourcePayload = {
        ...resourceData,
        document: documentUrl,
      };

      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(resourcePayload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.message || 'Failed to add resource');
        return;
      }

      setResources((currentResources) => [data, ...currentResources]);
      setResourceData({
        title: '',
        description: '',
        url: '',
        type: 'documentation',
        category: 'general',
        difficulty: 'beginner',
        tags: '',
        assignmentMode: 'all',
        assignedInterns: [],
        document: '',
      });
      setResourceDocumentFile(null);
      setSuccessMessage('Resource added successfully.');
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to add resource.');
    }
  };

  const handleDeleteResource = async (id) => {
    const token = localStorage.getItem('token');
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.message || 'Failed to delete resource');
        return;
      }

      setResources((currentResources) => currentResources.filter((resource) => resource._id !== id));
      setSuccessMessage('Resource deleted successfully.');
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to delete resource.');
    }
  };

  const handleAddPresentationTopic = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/presentation-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(presentationTopicData),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.message || 'Failed to assign presentation topic');
        return;
      }

      setPresentationTopics((currentTopics) => [data, ...currentTopics]);
      setPresentationTopicData({
        internId: '',
        title: '',
        description: '',
        dueDate: '',
      });
      setSuccessMessage('Presentation topic assigned successfully.');
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to assign presentation topic.');
    }
  };

  const handleAddGroupMeeting = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload = {
        ...groupMeetingData,
        scheduledAt: new Date(groupMeetingData.scheduledAt).toISOString(),
        durationMinutes: Number(groupMeetingData.durationMinutes) || 60,
        invitedInterns: groupMeetingData.audience === 'selected' ? groupMeetingData.invitedInterns : [],
      };

      const res = await fetch('/api/group-meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.message || 'Failed to schedule group meet');
        return;
      }

      setGroupMeetings((currentMeetings) => [data, ...currentMeetings]);
      setGroupMeetingData({
        title: '',
        description: '',
        meetLink: '',
        scheduledAt: '',
        durationMinutes: 60,
        audience: 'all',
        invitedInterns: [],
      });
      setSuccessMessage('Group meet scheduled and email notifications sent.');
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to schedule group meet.');
    }
  };

  const handleMarkAsPaid = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/bills/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ status: 'Paid' }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        const fetchRes = await fetch('/api/bills', {
          headers: { 'x-auth-token': token },
        });
        const updatedBills = await fetchRes.json();
        if (fetchRes.ok) {
          setBills(updatedBills);
        }
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentNotDone = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/bills/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ status: 'Unpaid', paidAmount: 0 }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        const fetchRes = await fetch('/api/bills', {
          headers: { 'x-auth-token': token },
        });
        const updatedBills = await fetchRes.json();
        if (fetchRes.ok) {
          setBills(updatedBills);
        }
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    const dateParts = dateString.split('T')[0].split('-');
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    return date.toLocaleDateString();
  };

  const handleDownloadBill = (bill) => {
    if (!bill.client) {
      alert('Client data is not available for this bill.');
      return;
    }
    const clientData = clients.find(c => c._id === bill.client._id);

    if (!clientData) {
      alert('Full client data not found for this bill.');
      return;
    }

    const invoiceContent = `
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #0d1117;
            color: #c9d1d9;
            margin: 0;
            padding: 20px;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 50px;
            background-color: #161b22;
            border: 1px solid #30363d;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 50px;
        }
        .header .logo {
            max-width: 150px;
        }
        .company-details h1 {
            margin: 0;
            color: #58a6ff;
            font-size: 2.2em;
            font-weight: 600;
        }
        .details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 50px;
        }
        .client-details, .invoice-details {
            width: 48%;
        }
        .client-details strong, .invoice-details strong {
            color: #58a6ff;
            display: block;
            margin-bottom: 10px;
            font-weight: 500;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
        }
        .items-table thead th {
            background-color: #21262d;
            color: #f0f6fc;
            padding: 15px;
            text-align: left;
            font-weight: 500;
            text-transform: uppercase;
            font-size: 0.85em;
            border-bottom: 1px solid #30363d;
        }
        .items-table tbody tr {
            border-bottom: 1px solid #30363d;
        }
        .items-table tbody tr:last-child {
            border-bottom: none;
        }
        .items-table td {
            padding: 20px 15px;
        }
        .items-table .description {
            font-weight: 500;
        }
        .items-table .qty, .items-table .rate, .items-table .amount {
            text-align: right;
        }
        .total-section {
            margin-top: 30px;
            text-align: right;
        }
        .total-section .grand-total {
            font-size: 1.6em;
            font-weight: 600;
            color: #58a6ff;
            margin-bottom: 10px;
        }
    </style>
    <div class="invoice-box">
        <header class="header">
            <div class="logo">
                <img src="/nexbyte-logo.png" alt="Nexbyte_Core Logo" style="max-width: 180px;">
            </div>
            <div class="company-details">
                <h1>INVOICE</h1>
            </div>
        </header>
        <section class="details">
            <div class="client-details">
                <strong>BILL TO:</strong>
                <div>${clientData.contactPerson}</div>
                <div>${clientData.clientName}</div>
                <div>${clientData.billingAddress || 'N/A'}</div>
                <div>${clientData.email}</div>
            </div>
            <div class="invoice-details">
                <div><strong>Invoice #:</strong> ${bill._id}</div>
                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                <div><strong>Due Date:</strong> ${new Date(bill.dueDate).toLocaleDateString()}</div>
            </div>
        </section>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="qty">Qty</th>
                    <th class="rate">Rate</th>
                    <th class="amount">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="description">
                        <strong>${bill.description}</strong>
                    </td>
                    <td class="qty">1</td>
                    <td class="rate">₹${bill.amount.toFixed(2)}</td>
                    <td class="amount">₹${bill.amount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
        <section class="total-section">
            <div class="grand-total">
                <strong>TOTAL DUE:</strong> ₹${bill.amount.toFixed(2)}
            </div>
        </section>
        <footer class="footer">
            <div>Thank you for choosing Nexbyte_Core!</div>
        </footer>
    </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = invoiceContent;

    const opt = {
      margin:       0,
      filename:     `invoice_${bill._id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, backgroundColor: '#0d1117' },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    window.html2pdf().from(element).set(opt).save();
  };

  const handleApprovePayment = async (billId, paymentId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/bills/${billId}/approve-payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ paymentId }),
      });
      const updatedBill = await res.json();
      if (res.ok) {
        setBills(bills.map(b => b._id === billId ? updatedBill : b));
      } else {
        throw new Error(updatedBill.message || 'Failed to approve payment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectPayment = async (billId, paymentId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/bills/${billId}/reject-payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ paymentId }),
      });
      const updatedBill = await res.json();
      if (res.ok) {
        setBills(bills.map(b => b._id === billId ? updatedBill : b));
      } else {
        throw new Error(updatedBill.message || 'Failed to reject payment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadSrs = (project) => {
    if (!project || !project.srsDocument) {
      alert('SRS document is not available for this project.');
      return;
    }
    window.open(project.srsDocument, '_blank');
  };



  const handleShowInternReport = async (internId) => {
    setSelectedInternForReport(internId);
    setReportLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/intern-report/${internId}`, {
        headers: {
          'x-auth-token': token,
        },
      });
      if (res.ok) {
        const reportData = await res.json();
        setInternReport(reportData);
        setShowInternReport(true);
      } else {
        console.error("Failed to fetch intern report");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const closeInternReport = () => {
    setShowInternReport(false);
    setSelectedInternForReport(null);
    setInternReport(null);
  };

  const handleSrsChange = (e) => {
    setLocalSrsData({ ...localSrsData, [e.target.name]: e.target.value });
  };

  const handleGenerateSrs = (e) => {
    e.preventDefault();
    const selectedClient = clients.find(client => client._id === selectedClientId);
    const fullSrsData = {
      ...localSrsData,
      client: selectedClient,
    };
    setSrsFullData(fullSrsData);
    navigate('/srs-generator');
  };

  const handleClientSelect = (clientId) => {
    setSelectedClientId(clientId);
    const selectedClient = clients.find(client => client._id === clientId);
    if (selectedClient) {
      setLocalSrsData({
        projectName: selectedClient.projectName || '',
        projectDescription: selectedClient.projectRequirements || '',
        projectRequirements: selectedClient.projectRequirements || '',
        targetAudience: '',
        functionalRequirements: '',
        nonFunctionalRequirements: '',
      });
    }
  };

  const handleShowTracker = async (client) => {
    setSelectedClientForTracker(client);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/clients/${client._id}/milestone`, {
        headers: {
          'x-auth-token': token,
        },
      });
      if (res.ok) {
        const clientWithMilestone = await res.json();
        setMilestone(clientWithMilestone.milestone);
        setIsTrackerModalOpen(true);
      } else {
        console.error("Failed to fetch milestone");
      }
    } catch (err) {
      console.error(err);
    }
  };

  

  const handleUpdateProjectMilestone = async (projectId, milestone) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/projects/${projectId}/milestone`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ milestone })
      });
      if (res.ok) {
        setSuccessMessage('Milestone updated');
        setTimeout(() => setSuccessMessage(''), 3000);
        const fetchRes = await fetch('/api/projects', { headers: { 'x-auth-token': token } });
        const updatedProjects = await fetchRes.json();
        if (fetchRes.ok) setProjects(updatedProjects);
      }
    } catch(err) { console.error(err); }
  };

  const handleUploadSrs = async (projectId, file) => {
    if (!file) return;
    try {
      setSuccessMessage('Uploading SRS...');
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('srsFile', file);
      const res = await fetch(`/api/projects/${projectId}/srs`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: formData
      });
      if (res.ok) {
        setSuccessMessage('SRS Uploaded successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        const fetchRes = await fetch('/api/projects', { headers: { 'x-auth-token': token } });
        const updatedProjects = await fetchRes.json();
        if (fetchRes.ok) setProjects(updatedProjects);
      }
    } catch(err) { console.error(err); }
  };

  const handleUploadInvoice = async (billId, file) => {
    if (!file) return;
    try {
      setSuccessMessage('Uploading Invoice...');
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('invoiceFile', file);
      const res = await fetch(`/api/bills/${billId}/upload`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: formData
      });
      if (res.ok) {
        setSuccessMessage('Invoice Uploaded successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        const fetchRes = await fetch('/api/bills', { headers: { 'x-auth-token': token } });
        const updatedBills = await fetchRes.json();
        if (fetchRes.ok) setBills(updatedBills);
      }
    } catch(err) { console.error(err); }
  };

  console.log('Bills:', bills);
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <div className="card">
          <h1>Admin Dashboard</h1>
          {successMessage && <div className="success-message">{successMessage}</div>}
          {errorMessage && <div className="error-message" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #fecaca' }}>{errorMessage}</div>}
          {location.pathname === '/admin/contacts' && (
            <div>
              <h2>Contact Messages</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact._id}>
                      <td>{contact.name}</td>
                      <td>{contact.email}</td>
                      <td>{contact.mobile}</td>
                      <td>{contact.message}</td>
                      <td>{new Date(contact.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {location.pathname === '/admin/messages' && (
            <div>
              <h2>Client Messages</h2>
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message._id}>
                      <td>{message.client?.clientName || 'N/A'}</td>
                      <td>{message.message}</td>
                      <td>{new Date(message.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {location.pathname === '/admin/members' && (
            <div>
              <h2>Manage Members</h2>
              <div className="form-container">
                <form onSubmit={handleAddMember}>
                  <h3>Add New Member</h3>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="intern">Intern</option>
                  </select>
                  {role === 'intern' && (
                    <>
                      <label>Intern Type:</label>
                      <select value={internType} onChange={(e) => setInternType(e.target.value)}>
                        <option value="free">Free Intern (no money in no money out)</option>
                        <option value="stipend">Stipend Intern (Intern gets money based on growth)</option>
                      </select>
                      <label>Internship Start Date:</label>
                      <input
                        type="date"
                        placeholder="Internship Start Date"
                        value={internshipStartDate}
                        onChange={(e) => setInternshipStartDate(e.target.value)}
                        required
                      />
                      <label>Internship End Date:</label>
                      <input
                        type="date"
                        placeholder="Internship End Date"
                        value={internshipEndDate}
                        onChange={(e) => setInternshipEndDate(e.target.value)}
                        required
                      />
                      <label>Offer Acceptance Deadline:</label>
                      <input
                        type="date"
                        placeholder="Acceptance Date"
                        value={acceptanceDate}
                        onChange={(e) => setAcceptanceDate(e.target.value)}
                        required
                      />
                    </>
                  )}
                  <button type="submit" className="btn btn-primary">Add Member</button>
                </form>
              </div>

              <h3>All Members</h3>
              <div className="iow-admin-card">
                <div className="iow-admin-title">Intern of the Week</div>
                <div className="iow-admin-row">
                  <span className="iow-admin-label">Current</span>
                  <span className="iow-admin-value">
                    {internOfWeekCurrent?.intern?.email ? internOfWeekCurrent.intern.email : 'Not set'}
                  </span>
                </div>
                <div className="iow-admin-actions">
                  <button
                    onClick={handleClearInternOfWeek}
                    className="btn btn-warning"
                    disabled={internOfWeekUpdatingFor === 'CLEAR'}
                  >
                    {internOfWeekUpdatingFor === 'CLEAR' ? 'Clearing...' : 'Clear This Week'}
                  </button>
                </div>
              </div>
              {successMessage && <p className="resource-message success">{successMessage}</p>}
              {errorMessage && <p className="resource-message error">{errorMessage}</p>}
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Intern Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Acceptance Date</th>
                    <th>Payment</th>
                    <th>Intern of Week</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member._id}>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                      <td>{member.role === 'intern' ? (member.internType === 'free' ? 'Free' : 'Stipend') : 'N/A'}</td>
                      <td>{member.role === 'intern' ? formatDate(member.internshipStartDate) : 'N/A'}</td>
                      <td>{member.role === 'intern' ? formatDate(member.internshipEndDate) : 'N/A'}</td>
                      <td>{formatDate(member.acceptanceDate)}</td>
                      <td>{formatPaymentStatus(member)}</td>
                      <td>
                        {member.role === 'intern' ? (
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600 }}>
                              {internOfWeekCurrent?.intern?._id === member._id ? 'Current • ' : ''}
                              Wins: {internOfWeekCountByInternId[member._id] ?? 0}
                            </span>
                            <button
                              onClick={() => handleSetInternOfWeek(member._id)}
                              className="btn btn-primary"
                              disabled={internOfWeekUpdatingFor === member._id}
                            >
                              {internOfWeekUpdatingFor === member._id ? 'Setting...' : 'Set'}
                            </button>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>
                        <button onClick={() => handleDeleteMember(member._id)} className="btn btn-danger">Delete</button>
                        {(member.role === 'intern' || member.role === 'user' || member.role === 'member') && (
                          <button onClick={() => handleShowInternReport(member._id)} className="btn btn-info">
                            {reportLoading && selectedInternForReport === member._id ? 'Loading...' : 'View Report'}
                          </button>
                        )}
                        {member.role === 'intern' && member.internFeeStatus !== 'paid' && (
                          <button
                            onClick={() => handleSendInternPaymentReminder(member._id)}
                            className="btn btn-secondary"
                            disabled={paymentReminderSendingTo === member._id}
                          >
                            {paymentReminderSendingTo === member._id ? 'Sending...' : 'Send Payment Mail'}
                          </button>
                        )}
                        {member.role === 'intern' && (
                          <>
                            <input
                              type="text"
                              placeholder="Payment ref (optional)"
                              value={paymentReferenceByInternId[member._id] || ''}
                              onChange={(e) =>
                                setPaymentReferenceByInternId((prev) => ({ ...prev, [member._id]: e.target.value }))
                              }
                              style={{ marginLeft: '8px', maxWidth: '180px' }}
                            />
                            {member.internFeeStatus === 'paid' ? (
                              <button
                                onClick={() => handleUpdateInternPaymentStatus(member._id, 'unpaid')}
                                className="btn btn-warning"
                                disabled={paymentStatusUpdatingFor === member._id}
                              >
                                {paymentStatusUpdatingFor === member._id ? 'Updating...' : 'Mark Unpaid'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateInternPaymentStatus(member._id, 'paid')}
                                className="btn btn-success"
                                disabled={paymentStatusUpdatingFor === member._id}
                              >
                                {paymentStatusUpdatingFor === member._id ? 'Updating...' : 'Mark Paid'}
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {location.pathname === '/admin/clients' && (
            <div>
              <h2>Manage Clients</h2>
              <div className="form-container">
                <form onSubmit={handleAddClient}>
                  <h3>Add New Client</h3>
                  <input type="text" name="clientName" placeholder="Client/Company Name" value={clientData.clientName} onChange={handleClientChange} required />
                  <input type="text" name="contactPerson" placeholder="Contact Person's Name" value={clientData.contactPerson} onChange={handleClientChange} required />
                  <input type="email" name="email" placeholder="Email Address" value={clientData.email} onChange={handleClientChange} required />
                  <input type="text" name="phone" placeholder="Phone Number" value={clientData.phone} onChange={handleClientChange} />
                  <input type="text" name="companyAddress" placeholder="Company Address" value={clientData.companyAddress} onChange={handleClientChange} />
                  <input type="text" name="projectName" placeholder="Project Name" value={clientData.projectName} onChange={handleClientChange} required />
                  <input type="text" name="projectType" placeholder="Project Type" value={clientData.projectType} onChange={handleClientChange} />
                  <textarea name="projectRequirements" placeholder="Project Requirements" value={clientData.projectRequirements} onChange={handleClientChange}></textarea>
                  <input type="date" name="projectDeadline" placeholder="Project Deadline" value={clientData.projectDeadline} onChange={handleClientChange} />
                  <input type="number" name="totalBudget" placeholder="Total Budget" value={clientData.totalBudget} onChange={handleClientChange} />
                  <input type="text" name="billingAddress" placeholder="Billing Address" value={clientData.billingAddress} onChange={handleClientChange} />
                  <input type="text" name="gstNumber" placeholder="GST Number" value={clientData.gstNumber} onChange={handleClientChange} />
                  <input type="text" name="paymentTerms" placeholder="Payment Terms" value={clientData.paymentTerms} onChange={handleClientChange} />
                  <input type="text" name="paymentMethod" placeholder="Payment Method" value={clientData.paymentMethod} onChange={handleClientChange} />
                  <input type="text" name="domainRegistrarLogin" placeholder="Domain Registrar Login" value={clientData.domainRegistrarLogin} onChange={handleClientChange} />
                  <input type="text" name="webHostingLogin" placeholder="Web Hosting Login" value={clientData.webHostingLogin} onChange={handleClientChange} />
                  <input type="text" name="logoAndBrandingFiles" placeholder="Logo and Branding Files (URL)" value={clientData.logoAndBrandingFiles} onChange={handleClientChange} />
                  <input type="text" name="content" placeholder="Content (URL)" value={clientData.content} onChange={handleClientChange} />
                  <button type="submit" className="btn btn-primary">Add Client</button>
                </form>
              </div>

              <h3>All Clients</h3>
              <table>
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Contact Person</th>
                    <th>Email</th>
                    <th>Project Name</th>
                    <th>Password</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client._id}>
                      <td>{client.clientName}</td>
                      <td>{client.contactPerson}</td>
                      <td>{client.email}</td>
                      <td>{client.projectName}</td>
                      <td>
                        {clientPasswords[client._id] ? (
                          clientPasswords[client._id]
                        ) : (
                          <button onClick={() => handleShowPassword(client._id)} className="btn btn-secondary">Show Password</button>
                        )}
                      </td>
                      <td>
                        <button onClick={() => handleDeleteClient(client._id)} className="btn btn-danger">Delete</button>
                        <button onClick={() => handleShowTracker(client)} className="btn btn-info">Show Tracker</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {location.pathname === '/admin/projects' && (
            <div>
              <h2>Manage Projects</h2>
              <div className="form-container">
                <form onSubmit={handleAddProject}>
                  <h3>Add New Project</h3>
                  <input type="text" name="projectName" placeholder="Project Name" value={projectData.projectName} onChange={handleProjectChange} required />
                  <input type="text" name="projectType" placeholder="Project Type" value={projectData.projectType} onChange={handleProjectChange} />
                  <textarea name="projectDescription" placeholder="Project Description" value={projectData.projectDescription} onChange={handleProjectChange}></textarea>
                  <input type="number" name="totalBudget" placeholder="Total Budget" value={projectData.totalBudget} onChange={handleProjectChange} />
                  <input type="date" name="projectDeadline" placeholder="Project Deadline" value={projectData.projectDeadline} onChange={handleProjectChange} />
                  <select name="clientType" value={projectData.clientType} onChange={handleProjectChange} required>
                    <option value="non-client">Non-Client Project</option>
                    <option value="client">Client Project</option>
                  </select>
                  {projectData.clientType === 'client' && (
                    <select name="associatedClient" value={projectData.associatedClient} onChange={handleProjectChange} required>
                      <option value="">Select a Client</option>
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>{client.clientName} - {client.projectName}</option>
                      ))}
                    </select>
                  )}
                  <button type="submit" className="btn btn-primary">Add Project</button>
                </form>
              </div>

              <h3>All Projects</h3>
              <table>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Project Type</th>
                    <th>Description</th>
                    <th>Total Budget</th>
                    <th>Deadline</th>
                    <th>Associated Client</th>
                    <th>Status & SRS</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project._id}>
                      <td>{project.projectName}</td>
                      <td>{project.projectType}</td>
                      <td>{project.projectDescription}</td>
                      <td>{project.totalBudget}</td>
                      <td>{project.projectDeadline ? new Date(project.projectDeadline).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        {project.associatedClient ? 
                          (project.associatedClient.clientName || 'Client') : 
                          'N/A'
                        }
                      </td>
                      <td>
                        <div>
                          <select 
                            value={project.milestone || 'Planning'} 
                            onChange={(e) => handleUpdateProjectMilestone(project._id, e.target.value)}
                            style={{ marginBottom: '5px' }}
                          >
                            <option value="Planning">Planning</option>
                            <option value="Design">Design</option>
                            <option value="Development">Development</option>
                            <option value="Testing">Testing</option>
                            <option value="Deployment">Deployment</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <div>
                          <input type="file" onChange={(e) => handleUploadSrs(project._id, e.target.files[0])} />
                        </div>
                        {project.srsDocument && (
                          <div style={{ marginTop: '5px' }}>
                            <a href={project.srsDocument} target="_blank" rel="noreferrer">View SRS</a>
                          </div>
                        )}
                      </td>
                      <td>
                        <button onClick={() => handleDeleteProject(project._id)} className="btn btn-danger">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {location.pathname === '/admin/billing' && (() => {
            const billsByClient = bills.reduce((acc, bill) => {
              const client = bill.client;
              if (!client) return acc;

              if (!acc[client._id]) {
                acc[client._id] = {
                  ...client,
                  bills: [],
                };
              }
              acc[client._id].bills.push(bill);
              return acc;
            }, {});

            return (
              <div>
                <h2>Manage Billing</h2>
                <div className="form-container">
                  <form onSubmit={handleAddBill}>
                    <h3>Add New Bill</h3>
                    <select name="client" onChange={handleBillChange} value={billData.client} required>
                      <option value="">Select a Client</option>
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>{client.clientName} - {client.projectName}</option>
                      ))}
                    </select>
                    <select name="project" onChange={handleBillChange} value={billData.project || ''}>
                      <option value="">Select a Project (Optional)</option>
                      {projects.map(project => (
                        <option key={project._id} value={project._id}>{project.projectName}</option>
                      ))}
                    </select>
                    <input type="number" name="amount" placeholder="Amount" value={billData.amount} onChange={handleBillChange} required />
                    <input type="date" name="dueDate" placeholder="Due Date" value={billData.dueDate} onChange={handleBillChange} required />
                    <textarea name="description" placeholder="Description" value={billData.description} onChange={handleBillChange}></textarea>
                    <button type="button" onClick={handleGenerateBillDescription} className="btn btn-secondary">Generate with AI</button>
                    <select name="status" onChange={handleBillChange} value={billData.status || 'Unpaid'}>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                    </select>
                    <input type="file" onChange={(e) => setBillInvoiceFile(e.target.files[0])} accept=".pdf,.doc,.docx,.jpg,.png" />
                    <button type="submit" className="btn btn-primary">Add Bill</button>
                  </form>
                </div>

                <h3>All Bills by Client</h3>
                {Object.values(billsByClient).map(client => {
                  const totalBilled = client.bills.reduce((sum, bill) => sum + bill.amount, 0);

                  return (
                    <div key={client._id} className="client-billing-section">
                      <h4>{client.clientName} - {client.projectName}</h4>
                      <div className="billing-summary admin-summary">
                        <div className="summary-card">
                          <h5>Total Budget</h5>
                          <p>₹{client.totalBudget ? client.totalBudget.toLocaleString() : 'N/A'}</p>
                        </div>
                        <div className="summary-card">
                          <h5>Total Billed</h5>
                          <p>₹{totalBilled.toLocaleString()}</p>
                        </div>
                        <div className="summary-card">
                          <button onClick={() => handleDownloadSrs(client)} className="btn btn-success">
                            Download SRS
                          </button>
                        </div>
                      </div>

                      <table>
                        <thead>
                          <tr>
                            <th>Amount</th>
                            <th>Description</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Action & Invoice</th>
                          </tr>
                        </thead>
                        <tbody>
                          {client.bills.map((bill) => (
                            <React.Fragment key={bill._id}>
                              <tr>
                                <td>
                                  <p>Total: ₹{bill.amount}</p>
                                  <p>Paid: ₹{bill.paidAmount || 0}</p>
                                </td>
                                <td>{bill.description}</td>
                                <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                                <td>{bill.status}</td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    {bill.status === 'Unpaid' && (
                                      <button onClick={() => handleMarkAsPaid(bill._id)} className="btn btn-success">Mark as Paid</button>
                                    )}
                                    {bill.status === 'Verification Pending' && (
                                      <button onClick={() => setExpandedBill(expandedBill === bill._id ? null : bill._id)} className="btn btn-primary">
                                        {expandedBill === bill._id ? 'Hide' : 'Show'} Pending
                                      </button>
                                    )}
                                    {bill.status === 'Paid' && (
                                      <button onClick={() => handlePaymentNotDone(bill._id)} className="btn btn-danger">Mark Unpaid</button>
                                    )}
                                    <button onClick={() => handleDownloadBill(bill)} className="btn btn-info">Download</button>
                                    <input type="file" onChange={(e) => handleUploadInvoice(bill._id, e.target.files[0])} />
                                    {bill.invoiceFile && (
                                      <a href={bill.invoiceFile} target="_blank" rel="noreferrer">View Uploaded Invoice</a>
                                    )}
                                  </div>
                                </td>
                              </tr>
                              {expandedBill === bill._id && bill.pendingPayments && bill.pendingPayments.length > 0 && (
                                <tr>
                                  <td colSpan="5">
                                    <div className="pending-payments">
                                      <h4>Pending Payments</h4>
                                      <ul>
                                        {bill.pendingPayments.map(p => (
                                          <li key={p._id}>
                                            <span>Amount: ₹{p.amount}</span>
                                            <span>ID: {p.transactionId}</span>
                                            <span>
                                              <button onClick={() => handleApprovePayment(bill._id, p._id)} className="btn btn-success">Approve</button>
                                              <button onClick={() => handleRejectPayment(bill._id, p._id)} className="btn btn-danger">Reject</button>
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {location.pathname === '/admin/resources' && (
            <div>
              <h2>Intern Resources</h2>
              <div className="form-container">
                <form onSubmit={handleAddResource}>
                  <h3>Add New Resource</h3>
                  <input
                    type="text"
                    name="title"
                    placeholder="Resource title"
                    value={resourceData.title}
                    onChange={handleResourceChange}
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="Short description"
                    value={resourceData.description}
                    onChange={handleResourceChange}
                    required
                  />
                  <input
                    type="url"
                    name="url"
                    placeholder="https://example.com/resource"
                    value={resourceData.url}
                    onChange={handleResourceChange}
                  />
                  <input
                    type="file"
                    name="document"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                    onChange={handleResourceDocumentChange}
                  />
                  <select name="type" value={resourceData.type} onChange={handleResourceChange}>
                    <option value="documentation">Documentation</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="video">Video</option>
                    <option value="article">Article</option>
                    <option value="tool">Tool</option>
                  </select>
                  <select name="category" value={resourceData.category} onChange={handleResourceChange}>
                    <option value="general">General</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="fullstack">Fullstack</option>
                    <option value="devops">DevOps</option>
                    <option value="design">Design</option>
                  </select>
                  <select name="difficulty" value={resourceData.difficulty} onChange={handleResourceChange}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <select name="assignmentMode" value={resourceData.assignmentMode} onChange={handleResourceChange}>
                    <option value="all">All Interns</option>
                    <option value="selected">Selected Interns</option>
                  </select>
                  {resourceData.assignmentMode === 'selected' && (
                    <div className="resource-intern-picker">
                      <h4>Select Interns</h4>
                      {resourceInterns.length > 0 ? (
                        <div className="resource-intern-list">
                          {resourceInterns.map((intern) => (
                            <label key={intern._id} className="resource-intern-option">
                              <input
                                type="checkbox"
                                checked={resourceData.assignedInterns.includes(intern._id)}
                                onChange={() => handleResourceInternToggle(intern._id)}
                              />
                              <span>{intern.email}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="resource-tags">No interns available for assignment.</p>
                      )}
                    </div>
                  )}
                  <input
                    type="text"
                    name="tags"
                    placeholder="react, api, ui"
                    value={resourceData.tags}
                    onChange={handleResourceChange}
                  />
                  {successMessage && <p className="resource-message success">{successMessage}</p>}
                  {errorMessage && <p className="resource-message error">{errorMessage}</p>}
                  <button type="submit" className="btn btn-primary">Add Resource</button>
                </form>
              </div>

              <div className="resource-admin-grid">
                {resources.length > 0 ? (
                  resources.map((resource) => (
                    <div key={resource._id} className="resource-admin-card">
                      <div className="resource-admin-meta">
                        <span>{resource.type}</span>
                        <span>{resource.category}</span>
                        <span>{resource.difficulty}</span>
                        <span>{resource.assignmentMode === 'selected' ? 'Selected Interns' : 'All Interns'}</span>
                      </div>
                      <h3>{resource.title}</h3>
                      <p>{resource.description}</p>
                      {resource.document ? (
                        <a href={resource.document} target="_blank" rel="noreferrer" className="btn btn-secondary">
                          Open Document
                        </a>
                      ) : resource.url ? (
                        <a href={resource.url} target="_blank" rel="noreferrer" className="btn btn-secondary">
                          Open Resource
                        </a>
                      ) : null}
                      {resource.assignmentMode === 'selected' && resource.assignedInterns && resource.assignedInterns.length > 0 && (
                        <p className="resource-tags">
                          Assigned to: {resource.assignedInterns.map((intern) => intern.email).join(', ')}
                        </p>
                      )}
                      {resource.tags && resource.tags.length > 0 && (
                        <p className="resource-tags">{resource.tags.join(', ')}</p>
                      )}
                      <button onClick={() => handleDeleteResource(resource._id)} className="btn btn-danger">
                        Delete Resource
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="generated-srs">
                    <h3>No resources added yet</h3>
                    <p>Admin se add karoge to intern panel me yahin se resources dikh jayenge.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {location.pathname === '/admin/presentation-topics' && (
            <div>
              <h2>Presentation Topics</h2>
              <div className="form-container">
                <form onSubmit={handleAddPresentationTopic}>
                  <h3>Assign Topic to Intern</h3>
                  <select
                    name="internId"
                    value={presentationTopicData.internId}
                    onChange={handlePresentationTopicChange}
                    required
                  >
                    <option value="">Select an Intern</option>
                    {members.filter((member) => member.role === 'intern').map((intern) => (
                      <option key={intern._id} value={intern._id}>{intern.email}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="title"
                    placeholder="Presentation topic title"
                    value={presentationTopicData.title}
                    onChange={handlePresentationTopicChange}
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="Topic details and expectations"
                    value={presentationTopicData.description}
                    onChange={handlePresentationTopicChange}
                    required
                  />
                  <input
                    type="date"
                    name="dueDate"
                    value={presentationTopicData.dueDate}
                    onChange={handlePresentationTopicChange}
                  />
                  {successMessage && <p className="resource-message success">{successMessage}</p>}
                  {errorMessage && <p className="resource-message error">{errorMessage}</p>}
                  <button type="submit" className="btn btn-primary">Assign Topic</button>
                </form>
              </div>

              <div className="resource-admin-grid">
                {presentationTopics.length > 0 ? (
                  presentationTopics.map((topic) => (
                    <div key={topic._id} className="resource-admin-card">
                      <div className="resource-admin-meta">
                        <span>{topic.status}</span>
                        <span>{topic.dueDate ? new Date(topic.dueDate).toLocaleDateString() : 'No Due Date'}</span>
                      </div>
                      <h3>{topic.title}</h3>
                      <p>{topic.description}</p>
                      <p className="resource-tags">Assigned to: {topic.intern?.email || 'Intern'}</p>
                      {topic.researchPaperUrl ? (
                        <a href={topic.researchPaperUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
                          View Research Paper
                        </a>
                      ) : (
                        <p className="resource-tags">Research paper not submitted yet.</p>
                      )}
                      {topic.submissionNotes && (
                        <p className="resource-tags">Submission Notes: {topic.submissionNotes}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="generated-srs">
                    <h3>No presentation topics assigned</h3>
                    <p>Assign a topic to an intern and they will be able to submit their research paper from the intern panel.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {location.pathname === '/admin/group-meetings' && (
            <div>
              <h2>Group Meetings</h2>
              <div className="form-container">
                <form onSubmit={handleAddGroupMeeting}>
                  <h3>Schedule a Group Meet</h3>
                  <input
                    type="text"
                    name="title"
                    placeholder="Meeting title"
                    value={groupMeetingData.title}
                    onChange={handleGroupMeetingChange}
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="Agenda / meeting purpose"
                    value={groupMeetingData.description}
                    onChange={handleGroupMeetingChange}
                    required
                  />
                  <input
                    type="url"
                    name="meetLink"
                    placeholder="https://meet.google.com/..."
                    value={groupMeetingData.meetLink}
                    onChange={handleGroupMeetingChange}
                    required
                  />
                  <input
                    type="datetime-local"
                    name="scheduledAt"
                    value={groupMeetingData.scheduledAt}
                    onChange={handleGroupMeetingChange}
                    required
                  />
                  <input
                    type="number"
                    name="durationMinutes"
                    min="15"
                    step="15"
                    placeholder="Duration in minutes"
                    value={groupMeetingData.durationMinutes}
                    onChange={handleGroupMeetingChange}
                    required
                  />
                  <select
                    name="audience"
                    value={groupMeetingData.audience}
                    onChange={handleGroupMeetingChange}
                  >
                    <option value="all">All Interns</option>
                    <option value="selected">Selected Interns</option>
                  </select>
                  {groupMeetingData.audience === 'selected' && (
                    <div className="resource-intern-picker">
                      <h4>Select Interns</h4>
                      {resourceInterns.length > 0 ? (
                        <div className="resource-intern-list">
                          {resourceInterns.map((intern) => (
                            <label key={intern._id} className="resource-intern-option">
                              <input
                                type="checkbox"
                                checked={groupMeetingData.invitedInterns.includes(intern._id)}
                                onChange={() => handleGroupMeetingInternToggle(intern._id)}
                              />
                              <span>{intern.email}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="resource-tags">No interns available for meeting invitation.</p>
                      )}
                    </div>
                  )}
                  {successMessage && <p className="resource-message success">{successMessage}</p>}
                  {errorMessage && <p className="resource-message error">{errorMessage}</p>}
                  <button type="submit" className="btn btn-primary">Schedule Group Meet</button>
                </form>
              </div>

              <div className="resource-admin-grid">
                {groupMeetings.length > 0 ? (
                  groupMeetings.map((meeting) => (
                    <div key={meeting._id} className="resource-admin-card">
                      <div className="resource-admin-meta">
                        <span>{formatMeetingDate(meeting.scheduledAt)}</span>
                        <span>{formatMeetingTime(meeting.scheduledAt)}</span>
                        <span>{meeting.durationMinutes} mins</span>
                      </div>
                      <h3>{meeting.title}</h3>
                      <p>{meeting.description}</p>
                      <a href={meeting.meetLink} target="_blank" rel="noreferrer" className="btn btn-secondary">
                        Open Meet Link
                      </a>
                      <p className="resource-tags">
                        Audience: {meeting.audience === 'all' ? 'All interns' : (meeting.invitedInterns || []).map((intern) => intern.email).join(', ')}
                      </p>
                      <p className="resource-tags">
                        Created by: {meeting.createdBy?.email || 'Admin'}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="generated-srs">
                    <h3>No group meets scheduled yet</h3>
                    <p>Yahan se admin interns ke liye group meet schedule kar sakta hai aur mail notification automatically chali jayegi.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {location.pathname === '/admin/srs-generator' && (
            <div>
              <h2>SRS Generator</h2>
              <div className="form-container">
                <form onSubmit={handleGenerateSrs}>
                  <h3>Generate New SRS</h3>
                  <select onChange={(e) => handleClientSelect(e.target.value)} value={selectedClientId}>
                    <option value="">Select a Client</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>{client.clientName} - {client.projectName}</option>
                    ))}
                  </select>
                  <input type="text" name="projectName" placeholder="Project Name" value={localSrsData.projectName} onChange={handleSrsChange} required />
                  <textarea name="projectDescription" placeholder="Project Description" value={localSrsData.projectDescription} onChange={handleSrsChange}></textarea>
                  <textarea name="projectRequirements" placeholder="Project Requirements" value={localSrsData.projectRequirements} onChange={handleSrsChange}></textarea>
                  <textarea name="targetAudience" placeholder="Target Audience" value={localSrsData.targetAudience} onChange={handleSrsChange}></textarea>
                  <textarea name="functionalRequirements" placeholder="Functional Requirements" value={localSrsData.functionalRequirements} onChange={handleSrsChange}></textarea>
                  <textarea name="nonFunctionalRequirements" placeholder="Non-Functional Requirements" value={localSrsData.nonFunctionalRequirements} onChange={handleSrsChange}></textarea>
                  <button type="submit" className="btn btn-primary">
                    Generate SRS
                  </button>
                </form>
              </div>
            </div>
          )}

          {location.pathname === '/admin/reports' && (
            <div>
              <h2>User Performance Reports</h2>
              <div className="user-reports-container">
                <div className="user-selection">
                  <h3>Select User for Detailed Report</h3>
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        handleShowInternReport(e.target.value);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a user...</option>
                    {members.filter(member => member.role !== 'admin').map(member => (
                      <option key={member._id} value={member._id}>
                        {member.email} - {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        {member.role === 'intern' && ` (${member.internType === 'free' ? 'Free' : 'Stipend'})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="all-users-summary">
                  <h3>All Users Summary</h3>
                  <table className="users-summary-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Intern Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.filter(member => member.role !== 'admin').map(member => (
                        <tr key={member._id}>
                          <td>{member.email}</td>
                          <td>
                            <span className={`role-badge ${member.role}`}>
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </span>
                          </td>
                          <td>
                            {member.role === 'intern' ? (
                              <span className={`intern-type-badge ${member.internType}`}>
                                {member.internType === 'free' ? 'Free' : 'Stipend'}
                              </span>
                            ) : 'N/A'}
                          </td>
                          <td>{member.role === 'intern' && member.internshipStartDate ? formatDate(member.internshipStartDate) : 'N/A'}</td>
                          <td>{member.role === 'intern' && member.internshipEndDate ? formatDate(member.internshipEndDate) : 'N/A'}</td>
                          <td>
                            {member.role === 'intern' && (() => {
                              const now = new Date();
                              const endDate = new Date(member.internshipEndDate);
                              const startDate = new Date(member.internshipStartDate);
                              if (now < startDate) return 'Not Started';
                              if (now > endDate) return 'Completed';
                              return 'Active';
                            })()}
                            {member.role !== 'intern' && 'Active'}
                          </td>
                          <td>
                            <button 
                              onClick={() => handleShowInternReport(member._id)} 
                              className="btn btn-primary"
                            >
                              View Report
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {location.pathname === '/admin/task-management' && (
            <div className="task-management-section">
              {showProjectTaskManagement && selectedProjectForTasks ? (
                <ProjectTaskManagement
                  projectId={selectedProjectForTasks._id}
                  projectName={selectedProjectForTasks.projectName}
                  onBack={() => {
                    setShowProjectTaskManagement(false);
                    setSelectedProjectForTasks(null);
                  }}
                />
              ) : (
                <div>
                  <h2>Project Task Management</h2>
                  <div className="project-selection">
                    <h3>Select a project to manage tasks</h3>
                    <div className="project-grid">
                      {projects.map(project => (
                        <div key={project._id} className="project-card">
                          <h4>{project.projectName}</h4>
                          <p>{project.projectDescription}</p>
                          <button
                            onClick={() => {
                              setSelectedProjectForTasks(project);
                              setShowProjectTaskManagement(true);
                            }}
                            className="btn btn-primary"
                          >
                            Manage Tasks
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {location.pathname === '/admin/tasks' && (
            <div>
              <TaskGenerator 
                clients={clients} 
                clientId={taskPageClientId} 
                onClientChange={setTaskPageClientId}
                onTasksSaved={handleTasksSaved}
              />
              <TaskList clientId={taskPageClientId} refreshTrigger={refreshTrigger} />
            </div>
          )}

          {location.pathname === '/admin/microprojects' && (
            <div>
              <h2>Microprojects (Intern Assignment)</h2>
              <div className="form-container">
                <form onSubmit={handleCreateMicroProject}>
                  <h3>Create Microproject</h3>
                  <input
                    type="text"
                    placeholder="Title"
                    value={microProjectForm.title}
                    onChange={(e) => setMicroProjectForm((p) => ({ ...p, title: e.target.value }))}
                    required
                  />
                  <textarea
                    placeholder="Details"
                    value={microProjectForm.details}
                    onChange={(e) => setMicroProjectForm((p) => ({ ...p, details: e.target.value }))}
                    rows={4}
                    required
                  />
                  <div style={{ marginTop: 10 }}>
                    <h4>Assign to Intern(s)</h4>
                    {resourceInterns.length > 0 ? (
                      <div style={{ display: 'grid', gap: 6, maxHeight: 220, overflow: 'auto', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}>
                        {resourceInterns.map((intern) => (
                          <label key={intern._id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              checked={microProjectForm.assignedInternIds.includes(intern._id)}
                              onChange={() => handleMicroProjectInternToggle(intern._id)}
                            />
                            <span>{intern.email}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p>No interns found.</p>
                    )}
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={microProjectSubmitting}>
                    {microProjectSubmitting ? 'Creating...' : 'Create Microproject'}
                  </button>
                </form>
              </div>

              <h3>Assigned Microprojects</h3>
              {microProjectLoading ? (
                <p>Loading...</p>
              ) : microProjects.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Details</th>
                      <th>Assigned To</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {microProjects.map((mp) => (
                      <tr key={mp._id}>
                        <td>{mp.title}</td>
                        <td style={{ maxWidth: 480, whiteSpace: 'pre-wrap' }}>{mp.details}</td>
                        <td>{(mp.assignedInterns || []).map((u) => u.email).join(', ') || '—'}</td>
                        <td>{mp.createdAt ? new Date(mp.createdAt).toLocaleString() : '—'}</td>
                        <td>
                          <button onClick={() => handleDeleteMicroProject(mp._id)} className="btn btn-danger">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No microprojects yet.</p>
              )}
            </div>
          )}

          {location.pathname === '/admin/task-monitoring' && (
            <div className="task-monitoring-section">
              <h2>Task Status Monitoring Dashboard</h2>
              <TaskMonitoringDashboard />
            </div>
          )}

          {location.pathname === '/admin/internship-dashboard' && (
            <InternshipDashboard />
          )}

          {location.pathname === '/admin/application-list' && (
            <ApplicationList />
          )}

          {location.pathname.startsWith('/admin/application-detail/') && (
            <ApplicationDetail />
          )}

          {location.pathname === '/admin/email-automation' && (
            <EmailAutomation />
          )}

          {location.pathname === '/admin/role-management' && (
            <RoleManagement />
          )}

          {location.pathname === '/admin/certificates' && (
            <CertificateAdminPanel />
          )}

          {location.pathname === '/admin/about-us' && (
            <div>
              <h2>About Us - Our Team</h2>
              <p style={{ color: '#6b7280', marginTop: 6 }}>
                Add, disable, or delete team members shown on the public About page.
              </p>

              {aboutTeamError && (
                <div className="error-message" style={{ marginTop: 12 }}>
                  {aboutTeamError}
                </div>
              )}

              <div className="card" style={{ marginTop: 16 }}>
                <h3>Add Team Member</h3>
                <form onSubmit={handleAddAboutTeamMember} style={{ display: 'grid', gap: 10, maxWidth: 720 }}>
                  <input
                    name="name"
                    placeholder="Name *"
                    value={aboutTeamForm.name}
                    onChange={handleAboutTeamFormChange}
                    required
                  />
                  <input
                    name="role"
                    placeholder="Role *"
                    value={aboutTeamForm.role}
                    onChange={handleAboutTeamFormChange}
                    required
                  />
                  <input
                    name="imageUrl"
                    placeholder="Image URL (e.g. /krishna.jpeg)"
                    value={aboutTeamForm.imageUrl}
                    onChange={handleAboutTeamFormChange}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAboutTeamImageChange}
                  />
                  <textarea
                    name="bio"
                    placeholder="Bio"
                    value={aboutTeamForm.bio}
                    onChange={handleAboutTeamFormChange}
                    rows={3}
                  />
                  <input
                    name="github"
                    placeholder="GitHub URL"
                    value={aboutTeamForm.github}
                    onChange={handleAboutTeamFormChange}
                  />
                  <input
                    name="linkedin"
                    placeholder="LinkedIn URL"
                    value={aboutTeamForm.linkedin}
                    onChange={handleAboutTeamFormChange}
                  />
                  <input
                    name="order"
                    type="number"
                    placeholder="Order"
                    value={aboutTeamForm.order}
                    onChange={handleAboutTeamFormChange}
                  />
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      name="isActive"
                      type="checkbox"
                      checked={aboutTeamForm.isActive}
                      onChange={handleAboutTeamFormChange}
                    />
                    Active (visible on About page)
                  </label>
                  <button type="submit" className="btn btn-success">
                    Add
                  </button>
                </form>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <h3>Current Team</h3>
                {aboutTeamLoading ? (
                  <p>Loading...</p>
                ) : aboutTeamMembers.length === 0 ? (
                  <p>No team members found.</p>
                ) : (
                  <table style={{ width: '100%', marginTop: 10 }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Order</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aboutTeamMembers.map((m) => (
                        <tr key={m._id}>
                          <td>{m.name}</td>
                          <td>{m.role}</td>
                          <td>{m.order ?? 0}</td>
                          <td>{m.isActive ? 'Active' : 'Hidden'}</td>
                          <td style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="btn btn-secondary"
                              type="button"
                              onClick={() => handleToggleAboutTeamActive(m)}
                            >
                              {m.isActive ? 'Hide' : 'Show'}
                            </button>
                            <button
                              className="btn btn-danger"
                              type="button"
                              onClick={() => handleDeleteAboutTeamMember(m._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {['/admin', '/admin/'].includes(location.pathname) && (
            <p>Welcome to the admin dashboard!</p>
          )}
        </div>



        {isTrackerModalOpen && selectedClientForTracker && (
          <Modal isOpen={isTrackerModalOpen} onClose={() => setIsTrackerModalOpen(false)}>
            <div className="project-tracker-modal">
              <h2>Project Tracker for {selectedClientForTracker.projectName}</h2>
              <ProjectTracker currentMilestone={activeTrackerMilestone} />
            </div>
          </Modal>
        )}

        {showInternReport && internReport && (
          <Modal isOpen={showInternReport} onClose={closeInternReport} title="Intern Performance Report" size="xl">
            <div className="intern-report-modal">
              {reportLoading ? (
                <p>Loading report...</p>
              ) : (
                <div className="report-content">
                  <div className="report-header">
                    <h3>{internReport.user.email}</h3>
                    <p>
                      {internReport.user.role === 'intern' ? 
                        `Internship Period: ${new Date(internReport.user.internshipStartDate).toLocaleDateString()} - ${new Date(internReport.user.internshipEndDate).toLocaleDateString()}` :
                        `User Role: ${internReport.user.role.charAt(0).toUpperCase() + internReport.user.role.slice(1)}`
                      }
                    </p>
                    {internReport.user.role === 'intern' && (
                      <p>Intern Type: {internReport.user.internType === 'free' ? 'Free' : 'Stipend'}</p>
                    )}
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <h4>Total Tasks</h4>
                      <div className="stat-number">{internReport.statistics.totalTasks}</div>
                    </div>
                    <div className="stat-card">
                      <h4>Completed</h4>
                      <div className="stat-number">{internReport.statistics.completedTasks}</div>
                    </div>
                    <div className="stat-card">
                      <h4>In Progress</h4>
                      <div className="stat-number">{internReport.statistics.inProgressTasks}</div>
                    </div>
                    <div className="stat-card">
                      <h4>Completion Rate</h4>
                      <div className="stat-number">{internReport.statistics.completionRate}%</div>
                    </div>
                  </div>

                  <div className="report-section">
                    <h4>Task Priority Breakdown</h4>
                    <div className="priority-breakdown">
                      <div className="priority-item">
                        <span className="priority-label">High Priority:</span>
                        <span>{internReport.priorityBreakdown.high.completed} of {internReport.priorityBreakdown.high.total} completed ({internReport.priorityBreakdown.high.completionRate}%)</span>
                      </div>
                      <div className="priority-item">
                        <span className="priority-label">Medium Priority:</span>
                        <span>{internReport.priorityBreakdown.medium.completed} of {internReport.priorityBreakdown.medium.total} completed ({internReport.priorityBreakdown.medium.completionRate}%)</span>
                      </div>
                      <div className="priority-item">
                        <span className="priority-label">Low Priority:</span>
                        <span>{internReport.priorityBreakdown.low.completed} of {internReport.priorityBreakdown.low.total} completed ({internReport.priorityBreakdown.low.completionRate}%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="report-section">
                    <h4>Recent Activity</h4>
                    <div className="recent-activity">
                      {internReport.recentActivity.map((task, index) => (
                        <div key={index} className="activity-item">
                          <div className="activity-header">
                            <span className="task-title">{task.title}</span>
                            <span className={`status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>
                              {task.status}
                            </span>
                          </div>
                          <div className="activity-details">
                            <span>Priority: {task.priority}</span>
                            <span>Reward: ₹{task.reward}</span>
                            {task.completedAt && (
                              <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="report-footer">
                    <p>Report generated on: {new Date().toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
};

export default Admin;
