// EmployeeManagement.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

export default function EmployeeManagement() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL;

  // State for adding employees
  const [employeeData, setEmployeeData] = useState({
    name: '',
    email: '',
    nationality: '',
    phone_number: '',
    department_id: '',
    extension_number: '',
    role_id: '',
    password: '',
    medical_conditions: '',
    accessibility_needs: '',
    home_address: '',
    emergency_contact: '',
    personal_email: ''
  });

  // Profile Picture State
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  // Document states
  const [employeeDocument, setEmployeeDocument] = useState(null);
  const [employeeDocumentType, setEmployeeDocumentType] = useState('');
  const [contactDocument, setContactDocument] = useState(null);
  const [contactDocumentType, setContactDocumentType] = useState('');
  const [vendorDocument, setVendorDocument] = useState(null);
  const [vendorDocumentType, setVendorDocumentType] = useState('');

  // State for adding departments
  const [departmentData, setDepartmentData] = useState({ name: '' });

  // State for adding contacts (companies)
  const [contactData, setContactData] = useState({
    name: '',
    phone_number: '',
    email: '',
    cr: '',
    vat: ''
  });

  // State for adding vendors (clients)
  const [vendorData, setVendorData] = useState({
    name: '',
    nationality: '',
    national_id_or_passport_number: '',
    telephone_number: '',
    phone_number: '',
    address: '',
    email: ''
  });

  // Fetched data
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);

  // States to track newly added IDs (optional, can be used for further actions)
  const [newEmployeeId, setNewEmployeeId] = useState(null);
  const [newContactId, setNewContactId] = useState(null);
  const [newVendorId, setNewVendorId] = useState(null);

  // Fetch departments, roles, and employees on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Departments
        const departmentResponse = await axios.get(`${apiUrl}/api/v1/departments/`, { withCredentials: true });
        if (departmentResponse.data.status === "success" && Array.isArray(departmentResponse.data.data.departments)) {
          setDepartments(departmentResponse.data.data.departments);
        } else {
          console.error('Unexpected department data structure:', departmentResponse.data);
          setDepartments([]);
        }

        // Fetch Roles
        const rolesResponse = await axios.get(`${apiUrl}/api/v1/roles/`, { withCredentials: true });
        if (rolesResponse.data?.data?.roles) {
          setRoles(rolesResponse.data.data.roles);
        } else {
          setRoles([]);
        }

        // Fetch Employees
        const employeesResponse = await axios.get(`${apiUrl}/api/v1/employees/`, { withCredentials: true });
        if (employeesResponse.data.status === "success" && Array.isArray(employeesResponse.data.data.employees)) {
          setEmployees(employeesResponse.data.data.employees);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ title: t('toast.error'), description: t('toast.fetchError'), variant: "destructive" });
      }
    };

    fetchData();
  }, [apiUrl, toast, t]);

  // Function to handle document uploads
  const handleDocumentUpload = async (entityType, id, document, documentType) => {
    if (!document || !documentType) return;

    const formData = new FormData();
    formData.append('attachment', document);
    formData.append('documentType', documentType);

    try {
      let endpoint;
      switch (entityType) {
        case 'employee':
          endpoint = `${apiUrl}/api/v1/employees/${id}/documents`;
          break;
        case 'company':
          endpoint = `${apiUrl}/api/v1/companies/${id}/documents`;
          break;
        case 'vendor':
          endpoint = `${apiUrl}/api/v1/vendors/${id}/documents`;
          break;
        default:
          throw new Error('Invalid entity type');
      }

      const response = await axios.patch(endpoint, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: t('toast.success'),
          description: t('toast.documentUploaded'),
          variant: "default"
        });

        // If uploading profilePic, update the employee's profile picture in the employees list
        if (entityType === 'employee' && documentType === 'profilePic') {
          const updatedEmployee = response.data.data.employee;
          setEmployees((prevEmployees) =>
            prevEmployees.map((emp) =>
              emp.id === updatedEmployee.id ? updatedEmployee : emp
            )
          );
        }
      }
    } catch (error) {
      console.error("Error uploading document:", error.response);
      toast({
        title: t('toast.error'),
        description: error.response?.data?.message || t('toast.documentUploadError'),
        variant: "destructive"
      });
    }
  };

  // Function to handle profile picture upload separately
  const handleProfilePictureUpload = async (employeeId, picture) => {
    if (!picture) return;

    const formData = new FormData();
    formData.append('attachment', picture);
    formData.append('documentType', 'profilePic');

    try {
      const response = await axios.patch(`${apiUrl}/api/v1/employees/${employeeId}/documents`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast({
          title: t('toast.success'),
          description: t('toast.profilePictureUploaded'),
          variant: "default"
        });

        const updatedEmployee = response.data.data.employee;
        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            emp.id === updatedEmployee.id ? updatedEmployee : emp
          )
        );

        // Update the preview to the uploaded image URL
        setProfilePicturePreview(updatedEmployee.attachment?.profilePic?.url ? `${apiUrl}${updatedEmployee.attachment.profilePic.url}` : null);
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error.response);
      toast({
        title: t('toast.error'),
        description: error.response?.data?.message || t('toast.profilePictureUploadError'),
        variant: "destructive"
      });
    }
  };

  // Function to handle adding a new employee
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ['name', 'email', 'department_id', 'role_id', 'password'];
    for (const field of requiredFields) {
      if (!employeeData[field]) {
        toast({ 
          title: t('toast.error'), 
          description: `${t('toast.requiredField')} ${t(field)}`, 
          variant: "destructive" 
        });
        return;
      }
    }

    try {
      // Step 1: Create the employee without files
      const response = await axios.post(`${apiUrl}/api/v1/employees/`, employeeData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status === "success") {
        const employee = response.data.data.employee;
        setNewEmployeeId(employee.id);
        toast({ 
          title: t('toast.success'), 
          description: t('toast.employeeAdded'), 
          variant: "default" 
        });

        // Add the new employee to the employees list
        setEmployees((prev) => [...prev, employee]);

        // Step 2: Upload Employee Document if provided
        if (employeeDocument && employeeDocumentType) {
          await handleDocumentUpload('employee', employee.id, employeeDocument, employeeDocumentType);
        }

        // Step 3: Upload Profile Picture if provided
        if (profilePicture) {
          await handleProfilePictureUpload(employee.id, profilePicture);
        }

        // Reset form fields
        setEmployeeData({
          name: '',
          email: '',
          nationality: '',
          phone_number: '',
          department_id: '',
          extension_number: '',
          role_id: '',
          password: '',
          medical_conditions: '',
          accessibility_needs: '',
          home_address: '',
          emergency_contact: '',
          personal_email: ''
        });
        setEmployeeDocument(null);
        setEmployeeDocumentType('');
        setProfilePicture(null);
        setProfilePicturePreview(null);
      } else {
        throw new Error(response.data.message || t('toast.addEmployeeError'));
      }
    } catch (error) {
      console.error("Error adding employee:", error.response);
      toast({ 
        title: t('toast.error'), 
        description: error.response?.data?.message || t('toast.addEmployeeError'), 
        variant: "destructive" 
      });
    }
  };

  // Function to handle adding a new department
  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/v1/departments/`, departmentData, { withCredentials: true });
      if (response.data.message === "Department created successfully.") {
        toast({ title: t('toast.success'), description: t('toast.departmentAdded'), variant: "default" });
        setDepartmentData({ name: '' });
        setDepartments((prev) => [...prev, response.data.department]);
      } else {
        throw new Error(t('toast.addDepartmentError'));
      }
    } catch (error) {
      console.error("Error adding department:", error.response);
      toast({ title: t('toast.error'), description: error.response?.data?.message || t('toast.addDepartmentError'), variant: "destructive" });
    }
  };

  // Function to handle adding a new contact (company)
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/v1/companies`, contactData, { withCredentials: true });
      if (response.data.status === "success") {
        const company = response.data.data.company;
        setNewContactId(company.id);
        toast({ title: t('toast.success'), description: t('toast.contactAdded'), variant: "default" });

        // Upload Contact Document if provided
        if (contactDocument && contactDocumentType) {
          await handleDocumentUpload('company', company.id, contactDocument, contactDocumentType);
        }

        // Reset form fields
        setContactData({
          name: '',
          phone_number: '',
          email: '',
          cr: '',
          vat: ''
        });
        setContactDocument(null);
        setContactDocumentType('');
      } else {
        throw new Error(t('toast.addContactError'));
      }
    } catch (error) {
      console.error("Error adding contact:", error.response);
      toast({ title: t('toast.error'), description: error.response?.data?.message || t('toast.addContactError'), variant: "destructive" });
    }
  };

  // Function to handle adding a new vendor (client)
  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/v1/vendors`, vendorData, { withCredentials: true });
      if (response.data.status === "success") {
        const vendor = response.data.data.vendor;
        setNewVendorId(vendor.id);
        toast({ title: t('toast.success'), description: t('toast.vendorAdded'), variant: "default" });

        // Upload Vendor Document if provided
        if (vendorDocument && vendorDocumentType) {
          await handleDocumentUpload('vendor', vendor.id, vendorDocument, vendorDocumentType);
        }

        // Reset form fields
        setVendorData({
          name: '',
          nationality: '',
          national_id_or_passport_number: '',
          telephone_number: '',
          phone_number: '',
          address: '',
          email: ''
        });
        setVendorDocument(null);
        setVendorDocumentType('');
      } else {
        throw new Error(t('toast.addVendorError'));
      }
    } catch (error) {
      console.error("Error adding vendor:", error.response);
      toast({ title: t('toast.error'), description: error.response?.data?.message || t('toast.addVendorError'), variant: "destructive" });
    }
  };

  // Cleanup the object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (profilePicturePreview && profilePicturePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePicturePreview);
      }
    };
  }, [profilePicturePreview]);

  return (
    <div className="container mx-auto p-10">
      <Tabs defaultValue="employees" className="w-full" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">{t('employees')}</TabsTrigger>
          <TabsTrigger value="departments">{t('departments')}</TabsTrigger>
          <TabsTrigger value="contacts">{t('Company')}</TabsTrigger>
          <TabsTrigger value="vendors">{t('Clients')}</TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees">
          <h2 className="text-xl font-semibold mb-4">{t('addEmployee')}</h2>
          <form onSubmit={handleEmployeeSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">

              {/* Profile Picture Upload */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="profile_picture">{t('profilePicture')}</Label>
                <Input
                  id="profile_picture"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProfilePicture(file);
                      const previewURL = URL.createObjectURL(file);
                      setProfilePicturePreview(previewURL);
                    } else {
                      setProfilePicture(null);
                      setProfilePicturePreview(null);
                    }
                  }}
                  accept=".jpg,.jpeg,.png"
                />
                {/* Image Preview */}
                {profilePicturePreview && (
                  <div className="mt-2">
                    <Label className="block mb-1">{t('preview')}:</Label>
                    <img
                      src={profilePicturePreview.startsWith('blob:') ? profilePicturePreview : `${apiUrl}${profilePicturePreview}`}
                      alt={t('profilePicturePreview')}
                      className="w-32 h-32 object-cover rounded-full border"
                    />
                  </div>
                )}
              </div>
              
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                  id="name"
                  value={employeeData.name}
                  onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={employeeData.email}
                  onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={employeeData.password}
                  onChange={(e) => setEmployeeData({ ...employeeData, password: e.target.value })}
                  required
                />
              </div>

              {/* Nationality */}
              <div className="space-y-2">
                <Label htmlFor="nationality">{t('nationality')}</Label>
                <Input
                  id="nationality"
                  value={employeeData.nationality}
                  onChange={(e) => setEmployeeData({ ...employeeData, nationality: e.target.value })}
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone_number">{t('phoneNumber')}</Label>
                <Input
                  id="phone_number"
                  value={employeeData.phone_number}
                  onChange={(e) => setEmployeeData({ ...employeeData, phone_number: e.target.value })}
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">{t('department')}</Label>
                <Select
                  dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  value={employeeData.department_id}
                  onValueChange={(value) => setEmployeeData({ ...employeeData, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectDepartment')} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Extension Number */}
              <div className="space-y-2">
                <Label htmlFor="extension_number">{t('extensionNumber')}</Label>
                <Input
                  id="extension_number"
                  type="number"
                  value={employeeData.extension_number}
                  onChange={(e) => setEmployeeData({ ...employeeData, extension_number: e.target.value })}
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">{t('role')}</Label>
                <Select
                  dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  value={employeeData.role_id}
                  onValueChange={(value) => setEmployeeData({ ...employeeData, role_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Medical Conditions */}
              <div className="space-y-2">
                <Label htmlFor="medical_conditions">{t('medicalConditions')}</Label>
                <Input
                  id="medical_conditions"
                  value={employeeData.medical_conditions}
                  onChange={(e) => setEmployeeData({ ...employeeData, medical_conditions: e.target.value })}
                />
              </div>

              {/* Accessibility Needs */}
              <div className="space-y-2">
                <Label htmlFor="accessibility_needs">{t('accessibilityNeeds')}</Label>
                <Input
                  id="accessibility_needs"
                  value={employeeData.accessibility_needs}
                  onChange={(e) => setEmployeeData({ ...employeeData, accessibility_needs: e.target.value })}
                />
              </div>

              {/* Home Address */}
              <div className="space-y-2">
                <Label htmlFor="home_address">{t('homeAddress')}</Label>
                <Input
                  id="home_address"
                  value={employeeData.home_address}
                  onChange={(e) => setEmployeeData({ ...employeeData, home_address: e.target.value })}
                />
              </div>

              {/* Emergency Contact */}
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">{t('emergencyContact')}</Label>
                <Input
                  id="emergency_contact"
                  value={employeeData.emergency_contact}
                  onChange={(e) => setEmployeeData({ ...employeeData, emergency_contact: e.target.value })}
                />
              </div>

              {/* Personal Email */}
              <div className="space-y-2">
                <Label htmlFor="personal_email">{t('personalEmail')}</Label>
                <Input
                  id="personal_email"
                  type="email"
                  value={employeeData.personal_email}
                  onChange={(e) => setEmployeeData({ ...employeeData, personal_email: e.target.value })}
                />
              </div>

              {/* Document Type */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="employee_document_type">{t('documentType')}</Label>
                <Select
                  value={employeeDocumentType}
                  onValueChange={setEmployeeDocumentType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectDocumentType')} />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="national_id">{t('nationalId')}</SelectItem>
                    <SelectItem value="passport">{t('passport')}</SelectItem>
                    <SelectItem value="contract">{t('contract')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Document Upload */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="employee_document">{t('document')}</Label>
                <Input
                  id="employee_document"
                  type="file"
                  onChange={(e) => setEmployeeDocument(e.target.files?.[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

            </div>
            <Button type="submit">{t('addEmployee')}</Button>
          </form>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <h2 className="text-xl font-semibold mb-4">{t('addDepartment')}</h2>
          <form onSubmit={handleDepartmentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dept_name">{t('departmentName')}</Label>
              <Input
                id="dept_name"
                value={departmentData.name}
                onChange={(e) => setDepartmentData({ ...departmentData, name: e.target.value })}
                required
              />
            </div>
            <Button type="submit">{t('addDepartment')}</Button>
          </form>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <h2 className="text-xl font-semibold mb-4">{t('addContact')}</h2>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="company_name">{t('companyName')}</Label>
                <Input
                  id="company_name"
                  value={contactData.name}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  required
                />
              </div>

              {/* Company Phone */}
              <div className="space-y-2">
                <Label htmlFor="company_phone">{t('companyPhone')}</Label>
                <Input
                  id="company_phone"
                  value={contactData.phone_number}
                  onChange={(e) => setContactData({ ...contactData, phone_number: e.target.value })}
                  required
                />
              </div>

              {/* Company Email */}
              <div className="space-y-2">
                <Label htmlFor="company_email">{t('companyEmail')}</Label>
                <Input
                  id="company_email"
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  required
                />
              </div>

              {/* Company CR */}
              <div className="space-y-2">
                <Label htmlFor="company_cr">{t('companyCR')}</Label>
                <Input
                  id="company_cr"
                  value={contactData.cr}
                  onChange={(e) => setContactData({ ...contactData, cr: e.target.value })}
                />
              </div>

              {/* Company VAT */}
              <div className="space-y-2">
                <Label htmlFor="company_vat">{t('companyVAT')}</Label>
                <Input
                  id="company_vat"
                  value={contactData.vat}
                  onChange={(e) => setContactData({ ...contactData, vat: e.target.value })}
                />
              </div>

              {/* Contact Document Type */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="contact_document_type">{t('documentType')}</Label>
                <Select
                  value={contactDocumentType}
                  onValueChange={setContactDocumentType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectDocumentType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CR">{t('companyCR')}</SelectItem>
                    <SelectItem value="VAT">{t('companyVAT')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Document Upload */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="contact_document">{t('document')}</Label>
                <Input
                  id="contact_document"
                  type="file"
                  onChange={(e) => setContactDocument(e.target.files?.[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            </div>
            <Button type="submit">{t('addContact')}</Button>
          </form>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors">
          <h2 className="text-xl font-semibold mb-4">{t('addVendor')}</h2>
          <form onSubmit={handleVendorSubmit} className="space-y-4 backdrop-blur-md hover:backdrop-blur-2xl">
            <div className="grid grid-cols-2 gap-4">
              {/* Vendor Name */}
              <div className="space-y-2">
                <Label htmlFor="vendor_name">{t('name')}</Label>
                <Input
                  id="vendor_name"
                  value={vendorData.name}
                  onChange={(e) => setVendorData({ ...vendorData, name: e.target.value })}
                  required
                />
              </div>

              {/* Vendor Nationality */}
              <div className="space-y-2">
                <Label htmlFor="vendor_nationality">{t('vendorNationality')}</Label>
                <Input
                  id="vendor_nationality"
                  value={vendorData.nationality}
                  onChange={(e) => setVendorData({ ...vendorData, nationality: e.target.value })}
                  required
                />
              </div>

              {/* Vendor ID */}
              <div className="space-y-2">
                <Label htmlFor="vendor_id">{t('vendorID')}</Label>
                <Input
                  id="vendor_id"
                  value={vendorData.national_id_or_passport_number}
                  onChange={(e) => setVendorData({ ...vendorData, national_id_or_passport_number: e.target.value })}
                  required
                />
              </div>

              {/* Vendor Telephone */}
              <div className="space-y-2">
                <Label htmlFor="vendor_telephone">{t('vendorTelephone')}</Label>
                <Input
                  id="vendor_telephone"
                  value={vendorData.telephone_number}
                  onChange={(e) => setVendorData({ ...vendorData, telephone_number: e.target.value })}
                  required
                />
              </div>

              {/* Vendor Phone */}
              <div className="space-y-2">
                <Label htmlFor="vendor_phone">{t('vendorPhone')}</Label>
                <Input
                  id="vendor_phone"
                  value={vendorData.phone_number}
                  onChange={(e) => setVendorData({ ...vendorData, phone_number: e.target.value })}
                  required
                />
              </div>

              {/* Vendor Address */}
              <div className="space-y-2">
                <Label htmlFor="vendor_address">{t('vendorAddress')}</Label>
                <Input
                  id="vendor_address"
                  value={vendorData.address}
                  onChange={(e) => setVendorData({ ...vendorData, address: e.target.value })}
                  required
                />
              </div>

              {/* Vendor Email */}
              <div className="space-y-2">
                <Label htmlFor="vendor_email">{t('vendorEmail')}</Label>
                <Input
                  id="vendor_email"
                  type="email"
                  value={vendorData.email}
                  onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
                  required
                />
              </div>

              {/* Vendor Document Type */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="vendor_document_type">{t('documentType')}</Label>
                <Select
                  value={vendorDocumentType}
                  onValueChange={setVendorDocumentType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectDocumentType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CR">{t('companyCR')}</SelectItem>
                    <SelectItem value="VAT">{t('companyVAT')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vendor Document Upload */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="vendor_document">{t('document')}</Label>
                <Input
                  id="vendor_document"
                  type="file"
                  onChange={(e) => setVendorDocument(e.target.files?.[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            </div>
            <Button type="submit">{t('addVendor')}</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

