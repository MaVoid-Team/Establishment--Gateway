'use client'

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload } from 'lucide-react'

export function UploadDocuments() {
  const [selectedContract, setSelectedContract] = useState(null)
  const [newVendorCreated, setNewVendorCreated] = useState(false)
  const [editedContract, setEditedContract] = useState({})
  const [vendors, setVendors] = useState([])
  const [contractType, setContractType] = useState("")
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [expiryDate, setExpiryDate] = useState(new Date().toISOString().split('T')[0])
  const [newVendor, setNewVendor] = useState({
    name: "",
    nationality: "",
    national_id_or_passport_number: "",
    telephone_number: "",
    phone_number: "",
    address: "",
    email: "",
  })
  const [showNewVendorDialog, setShowNewVendorDialog] = useState(false)
  const [departments, setDepartments] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [showNewCompanyDialog, setShowNewCompanyDialog] = useState(false)
  const [newCompany, setNewCompany] = useState({
    name: "",
    phone_number: "",
    email: "",
    cr: "",
    vat: "",
  })
  const [contractWith, setContractWith] = useState(null)
  const fileInputRef = useRef(null)

  const apiUrl = import.meta.env.VITE_API_URL

  const contractTypes = [
    "construction contracts",
    "engineering consultancy contracts",
    "marketing contracts",
    "financial services contracts",
    "legal consultancy contracts",
    "design contracts",
    "government contracts",
    "management and operation contracts",
    "lease contracts",
    "maintenance contracts",
    "security services contracts",
    "project development contracts",
  ]

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/vendors`, {
          withCredentials: true,
        })
        setVendors(response.data.data.vendors || [])
      } catch (error) {
        console.error("Failed to fetch vendors:", error)
      }
    }
    fetchVendors()
  }, [apiUrl, newVendorCreated])

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/departments`, {
          withCredentials: true,
        })
        setDepartments(response.data.data.departments || [])
      } catch (error) {
        console.error("Failed to fetch departments:", error)
      }
    }
    fetchDepartments()
  }, [apiUrl])

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/companies`, {
          withCredentials: true,
        })
        setCompanies(response.data.data.companies || [])
      } catch (error) {
        console.error("Failed to fetch companies:", error)
      }
    }
    fetchCompanies()
  }, [apiUrl])

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const preview = {
        title: file.name.replace(".pdf", ""),
        pdfUrl: URL.createObjectURL(file),
      }
      setSelectedContract(preview)
      setEditedContract(preview)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedContract((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewVendorInputChange = (e) => {
    const { name, value } = e.target
    setNewVendor((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewCompanyInputChange = (e) => {
    const { name, value } = e.target
    setNewCompany((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateNewVendor = async () => {
    try {
      const response = await axios.post(`${apiUrl}/api/v1/vendors`, newVendor, {
        withCredentials: true,
      })

      const newVendorData = response.data.data

      if (newVendorData && newVendorData.id && newVendorData.name) {
        setVendors((prev) => [...prev, newVendorData])
      } else {
        console.error("Unexpected vendor data structure:", newVendorData)
      }

      setNewVendorCreated((prev) => !prev)
      setShowNewVendorDialog(false)
      alert("Vendor created successfully!")
    } catch (error) {
      console.error("Failed to create vendor:", error)
      alert("Failed to create vendor.")
    }
  }

  const handleCreateNewCompany = async () => {
    try {
      const response = await axios.post(`${apiUrl}/api/v1/companies`, newCompany, {
        withCredentials: true,
      })

      const newCompanyData = response.data.data

      if (newCompanyData && newCompanyData.id && newCompanyData.name) {
        setCompanies((prev) => [...prev, newCompanyData])
      } else {
        console.error("Unexpected company data structure:", newCompanyData)
      }

      setShowNewCompanyDialog(false)
      alert("Company created successfully!")
    } catch (error) {
      console.error("Failed to create company:", error)
      alert("Failed to create company.")
    }
  }

  const handleSubmit = async () => {
    try {
      const formData = new FormData()
      
      formData.append('client', editedContract.title || '')
      formData.append('vendor', selectedVendor?.name || '')
      formData.append('type', contractType?.toLowerCase() || '')
      formData.append('company', selectedCompany?.name || '')
      formData.append('department', selectedDepartment?.name || '')
      formData.append('contract_value', editedContract.contractValue || '0')
      formData.append('change_order', editedContract.changeOrder || '0')
      formData.append('currency', editedContract.currency || 'USD')
      formData.append('status', editedContract.status || 'draft')
      formData.append('details', editedContract.details || '')
      formData.append('vendor_id', selectedVendor?.id?.toString() || '')
      formData.append('expiry_date', new Date(expiryDate).toISOString())
      formData.append('title', editedContract.title || '')
      formData.append('amount_paid', editedContract.amount_paid || '0')
      formData.append('amount_due', editedContract.amount_due || '0')

      if (fileInputRef.current?.files?.[0]) {
        formData.append('attachment', fileInputRef.current.files[0])
      }

      const response = await axios.post(`${apiUrl}/api/v1/documents/${selectedDepartment.id}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.status === 'success') {
        alert('Document uploaded successfully!')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error("Failed to create document:", error)
      alert(`Failed to create document: ${error.response?.data?.message || error.message}`)
    }
  }
  const titleField = (
    <div>
      <Label htmlFor="title">Title</Label>
      <Input
        id="title"
        name="title"
        value={editedContract.title || ""}
        onChange={handleInputChange}
        placeholder="Enter document title"
      />
    </div>
  )


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <Card className="flex flex-col h-full shadow-lg">
        <CardContent className="flex-1 p-4 cursor-pointer" onClick={triggerFileInput}>
          <div className="h-full bg-muted flex flex-col items-center justify-center relative">
            {selectedContract ? (
              <iframe src={selectedContract.pdfUrl} className="w-full h-full" title="PDF Viewer" />
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Click to upload a contract</p>
              </div>
            )}
          </div>
          <Input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      <Card className="flex flex-col h-full">
        <CardContent className="flex-1 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-6">
              <div>
                <Label>Contract With</Label>
                <RadioGroup
                  onValueChange={(value) => setContractWith(value)}
                  className="flex flex-col space-y-1 mt-2"
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

              {contractWith === 'client' && (
                <div>
                  <Label htmlFor="vendor">Client</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      onValueChange={(value) => {
                        const vendor = vendors.find((v) => v.id === parseInt(value, 10))
                        setSelectedVendor(vendor)
                      }}
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

              {contractWith === 'company' && (
                <div>
                  <Label htmlFor="company">Company</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      onValueChange={(value) => {
                        const company = companies.find((c) => c.id === parseInt(value, 10))
                        setSelectedCompany(company)
                      }}
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

              {contractWith && (
                <>
                  <div>
                  {titleField}
                    <Label htmlFor="department">Department</Label>
                    <Select
                      onValueChange={(value) => {
                        const department = departments.find((d) => d.id === parseInt(value, 10))
                        setSelectedDepartment(department)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id.toString()}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contract-type">Type</Label>
                    <Select onValueChange={(value) => setContractType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Contract Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractTypes.map((type) => (
                          <SelectItem className="capitalize" key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contractValue">Contract Value</Label>
                    <Input
                      id="contractValue"
                      name="contractValue"
                      type="number"
                      value={editedContract.contractValue || ""}
                      onChange={handleInputChange}
                      placeholder="Enter contract value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount_paid">Amount Paid</Label>
                    <Input
                      id="amount_paid"
                      name="amount_paid"
                      type="number"
                      value={editedContract.amount_paid || ""}
                      onChange={handleInputChange}
                      placeholder="Enter amount paid"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount_due">Amount Due</Label>
                    <Input
                      id="amount_due"
                      name="amount_due"
                      type="number"
                      value={editedContract.amount_due || ""}
                      onChange={handleInputChange}
                      placeholder="Enter contract value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="changeOrder">Change Order</Label>
                    <Input
                      id="changeOrder"
                      name="changeOrder"
                      value={editedContract.changeOrder || ""}
                      onChange={handleInputChange}
                      placeholder="Enter change order"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      name="currency"
                      value={editedContract.currency || ""}
                      onChange={handleInputChange}
                      placeholder="Enter currency"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Input
                      id="status"
                      name="status"
                      value={editedContract.status || ""}
                      onChange={handleInputChange}
                      placeholder="Enter status"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="details">Details</Label>
                    <Textarea
                      id="details"
                      name="details"
                      value={editedContract.details || ""}
                      onChange={handleInputChange}
                      placeholder="Enter contract details"
                      rows={4}
                    />
                  </div>
                  <Button className="mt-4" onClick={handleSubmit}>
                    Submit
                  </Button>
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

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
  )
}

