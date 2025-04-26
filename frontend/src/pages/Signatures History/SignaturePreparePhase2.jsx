'use client'

import { useState, useEffect} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";;
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


export default function SignaturePreparePhase2
() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Existing state variables
  const [document, setDocument] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  // New state variables for Contract With

  const [newVendorCreated, setNewVendorCreated] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [newVendor, setNewVendor] = useState({
    name: "",
    telephone_number: "",
    phone_number: "",
    address: "",
    email: "",
  });
  const [showNewVendorDialog, setShowNewVendorDialog] = useState(false);
  const [ setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showNewCompanyDialog, setShowNewCompanyDialog] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    phone_number: "",
    email: "",
  });
  const [contractWith, setContractWith] = useState(null);


  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [documentResponse, employeeResponse] = await Promise.all([
          axios.get(`${apiUrl}/api/v1/documents/${id}`, { withCredentials: true }),
          axios.get(`${apiUrl}/api/v1/employees/myData/`, { withCredentials: true })
        ]);

        const fetchedDocument = documentResponse.data.data.document;
        setDocument(fetchedDocument);

        // Initialize Contract With fields based on document details
        const documentDetails = JSON.parse(fetchedDocument.details || "{}");
        if (documentDetails.contractWith) {
          setContractWith(documentDetails.contractWith);
          if (documentDetails.contractWith === 'client') {
            setSelectedVendor({
              name: documentDetails.partyTwo || "",
              email: documentDetails.partyTwoEmail || "",
              phone_number: documentDetails.partyTwoPhone || "",
              company: documentDetails.companyDetails?.name || ""
            });
          } else if (documentDetails.contractWith === 'company') {
            setSelectedCompany({
              name: documentDetails.companyDetails?.name || "",
              phone_number: documentDetails.companyDetails?.phone_number || "",
              email: documentDetails.companyDetails?.email || "",
              cr: documentDetails.companyDetails?.cr || "",
              vat: documentDetails.companyDetails?.vat || ""
            });
          }
        }

        const fetchedEmployee = employeeResponse.data.data.employee;
        setEmployee(fetchedEmployee);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch document and employee data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, apiUrl]);

  // Fetch vendors, departments, and companies
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/vendors`, {
          withCredentials: true,
        });
        setVendors(response.data.data.vendors || []);
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      }
    };
    fetchVendors();
  }, [apiUrl, newVendorCreated]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/departments/`, {
          withCredentials: true,
        });
        setDepartments(response.data || []);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    };
    fetchDepartments();
  }, [apiUrl]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/companies`, {
          withCredentials: true,
        });
        setCompanies(response.data.data.companies || []);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      }
    };
    fetchCompanies();
  }, [apiUrl]);

  const handleNewVendorInputChange = (e) => {
    const { name, value } = e.target;
    setNewVendor((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setNewCompany((prev) => ({ ...prev, [name]: value }));
  };

  // Handlers for creating new vendor and company
  const handleCreateNewVendor = async () => {
    try {
      const response = await axios.post(`${apiUrl}/api/v1/vendors`, newVendor, {
        withCredentials: true,
      });

      const newVendorData = response.data.data;

      if (newVendorData && newVendorData.id && newVendorData.name) {
        setVendors((prev) => [...prev, newVendorData]);
      } else {
        console.error("Unexpected vendor data structure:", newVendorData);
      }

      setNewVendorCreated((prev) => !prev);
      setShowNewVendorDialog(false);
      toast({
        title: "Success",
        description: "Client created successfully!",
      });
    } catch (error) {
      console.error("Failed to create vendor:", error);
      toast({
        title: "Error",
        description: "Failed to create client.",
        variant: "destructive",
      });
    }
  };

  const handleCreateNewCompany = async () => {
    try {
      const response = await axios.post(`${apiUrl}/api/v1/companies`, newCompany, {
        withCredentials: true,
      });

      const newCompanyData = response.data.data;

      if (newCompanyData && newCompanyData.id && newCompanyData.name) {
        setCompanies((prev) => [...prev, newCompanyData]);
      } else {
        console.error("Unexpected company data structure:", newCompanyData);
      }

      setShowNewCompanyDialog(false);
      toast({
        title: "Success",
        description: "Company created successfully!",
      });
    } catch (error) {
      console.error("Failed to create company:", error);
      toast({
        title: "Error",
        description: "Failed to create company.",
        variant: "destructive",
      });
    }
  };


  // Handler for sending signature link
  const handleSendLink = async () => {
    setIsLoading(true);
    try {
      // Map document.type to a valid object_type
      let objectType = "document"; // Default to "document"
      if (document.type === "sales_contract") {
        objectType = "sales contract";
      } else if (document.type === "order") {
        objectType = "order";
      }
      console.log("objectType: " + objectType);
      const response = await axios.post(
        `${apiUrl}/api/v1/signatures`,
        {
          signer_type: document.vendor_id ? "vendor" : "company",
          signer_id: document.vendor_id || document.company_id,
          object_type: objectType,
          object_id: document.id
        },
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        toast({
          title: "Success",
          description: "Signature link sent successfully.",
        });

        navigate('/signatures-history');
      }
      console.log(response.data);
    } catch (error) {
      console.error("Failed to send signature link:", error);
      toast({
        title: "Error",
        description: "Failed to send signature link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-grow container mx-auto py-10 px-4">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Sender Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Sender</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sender-name">Name</Label>
                    <Input id="sender-name" value={employee?.name || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sender-email">Email</Label>
                    <Input id="sender-email" value={employee?.email || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sender-phone">Phone Number</Label>
                    <Input id="sender-phone" value={employee?.phone_number || ""} readOnly />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contract With Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Contract With</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      {/* Contract With Radio Group */}
                      <div>
                        <Label>Contract With</Label>
                        <RadioGroup
                          onValueChange={(value) => setContractWith(value)}
                          className="flex flex-col space-y-1 mt-2"
                          value={contractWith}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="client" id="contract-with-client" />
                            <Label htmlFor="contract-with-client">Client</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="company" id="contract-with-company" />
                            <Label htmlFor="contract-with-company">Company</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Client Selection */}
                      {contractWith === 'client' && (
                        <div>
                          <Label htmlFor="vendor">Client</Label>
                          <div className="flex items-center space-x-2">
                            <Select
                              onValueChange={(value) => {
                                const vendor = vendors.find((v) => v.id === parseInt(value, 10));
                                setSelectedVendor(vendor);
                              }}
                              value={selectedVendor?.id?.toString() || ""}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a Client" />
                              </SelectTrigger>
                              <SelectContent>
                                {vendors.map((vendor) => (
                                  <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                    {vendor.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button size="sm" onClick={() => setShowNewVendorDialog(true)}>
                              Create New Client
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Company Selection */}
                      {contractWith === 'company' && (
                        <div>
                          <Label htmlFor="company">Company</Label>
                          <div className="flex items-center space-x-2">
                            <Select
                              onValueChange={(value) => {
                                const company = companies.find((c) => c.id === parseInt(value, 10));
                                setSelectedCompany(company);
                              }}
                              value={selectedCompany?.id?.toString() || ""}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a Company" />
                              </SelectTrigger>
                              <SelectContent>
                                {companies.map((company) => (
                                  <SelectItem key={company.id} value={company.id.toString()}>
                                    {company.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button size="sm" onClick={() => setShowNewCompanyDialog(true)}>
                              Create New Company
                            </Button>
                          </div>
                        </div>
                      )}

                      
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Document Information */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Document Information</h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document-type">Document Type</Label>
                  <Input 
                    id="document-type" 
                    value={document?.type === "sales_contract" ? "sales contract" : 
                           document?.type === "order" ? "Order" : "Document"} 
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document-status">Status</Label>
                  <Input id="document-status" value={document?.status || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document-client">Client</Label>
                  <Input id="document-client" value={document?.client || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document-value">Contract Value</Label>
                  <Input id="document-value" value={`${document?.currency || ''} ${document?.contract_value || ''}`} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document-expiry">Expiry Date</Label>
                  <Input id="document-expiry" value={document?.expiry_date ? new Date(document.expiry_date).toLocaleDateString() : ""} readOnly />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto py-6 px-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate("/signatures-history")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendLink}
            disabled={isLoading}
            className="bg-[#C2B59B] hover:bg-[#B3A68C]"
          >
            {isLoading ? "Sending..." : "Send Signature Link"}
          </Button>
        </div>
      </footer>

      {/* Dialog for creating new client */}
      <Dialog open={showNewVendorDialog} onOpenChange={setShowNewVendorDialog}>
        <DialogContent>
          <h2 className="text-xl font-semibold">Create New Client</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="client-name">Name</Label>
              <Input
                id="client-name"
                name="name"
                value={newVendor.name}
                onChange={handleNewVendorInputChange}
                placeholder="Enter client name"
              />
            </div>
            <div>
              <Label htmlFor="client-nationality">Nationality</Label>
              <Input
                id="client-nationality"
                name="nationality"
                value={newVendor.nationality}
                onChange={handleNewVendorInputChange}
                placeholder="Enter nationality"
              />
            </div>
            <div>
              <Label htmlFor="client-id">National ID/Passport Number</Label>
              <Input
                id="client-id"
                name="national_id_or_passport_number"
                value={newVendor.national_id_or_passport_number}
                onChange={handleNewVendorInputChange}
                placeholder="Enter ID or passport number"
              />
            </div>
            <div>
              <Label htmlFor="client-telephone">Telephone Number</Label>
              <Input
                id="client-telephone"
                name="telephone_number"
                value={newVendor.telephone_number}
                onChange={handleNewVendorInputChange}
                placeholder="Enter telephone number"
              />
            </div>
            <div>
              <Label htmlFor="client-phone">Phone Number</Label>
              <Input
                id="client-phone"
                name="phone_number"
                value={newVendor.phone_number}
                onChange={handleNewVendorInputChange}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="client-address">Address</Label>
              <Input
                id="client-address"
                name="address"
                value={newVendor.address}
                onChange={handleNewVendorInputChange}
                placeholder="Enter address"
              />
            </div>
            <div>
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                name="email"
                value={newVendor.email}
                onChange={handleNewVendorInputChange}
                placeholder="Enter email address"
              />
            </div>
            <Button onClick={handleCreateNewVendor}>Create Client</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for creating new company */}
      <Dialog open={showNewCompanyDialog} onOpenChange={setShowNewCompanyDialog}>
        <DialogContent>
          <h2 className="text-xl font-semibold">Create New Company</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-name">Name</Label>
              <Input
                id="company-name"
                name="name"
                value={newCompany.name}
                onChange={handleNewCompanyInputChange}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <Label htmlFor="company-phone">Phone Number</Label>
              <Input
                id="company-phone"
                name="phone_number"
                value={newCompany.phone_number}
                onChange={handleNewCompanyInputChange}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                name="email"
                value={newCompany.email}
                onChange={handleNewCompanyInputChange}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="company-cr">CR Number</Label>
              <Input
                id="company-cr"
                name="cr"
                value={newCompany.cr}
                onChange={handleNewCompanyInputChange}
                placeholder="Enter CR number"
              />
            </div>
            <div>
              <Label htmlFor="company-vat">VAT Number</Label>
              <Input
                id="company-vat"
                name="vat"
                value={newCompany.vat}
                onChange={handleNewCompanyInputChange}
                placeholder="Enter VAT number"
              />
            </div>
            <Button onClick={handleCreateNewCompany}>Create Company</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
