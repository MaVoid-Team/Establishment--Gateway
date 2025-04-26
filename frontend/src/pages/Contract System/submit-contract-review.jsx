import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FilePreview } from "./filepreview";

const ContractReviewForm = () => {
  const { toast } = useToast();
  const [priorities] = useState([
    { id: 1, name: "Low" },
    { id: 2, name: "Medium" },
    { id: 3, name: "High" },
  ]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priorityId, setPriorityId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/v1/employees/myData`, { withCredentials: true });
      setIsAdmin(response.data.data.employee.employeeRole.permissions.isAdmin === "True");
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast({
        title: "Error",
        description: "Failed to check user permissions. Some features may be limited.",
        variant: "destructive",
      });
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/v1/departments`, { withCredentials: true });
      setDepartments(response.data.data.departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast({
        title: "Error",
        description: "Failed to load departments. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const fetchEmployees = async (deptId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/v1/departments/${deptId}/employees`, { withCredentials: true });
      setEmployees(response.data.data.employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employees. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDepartmentChange = (deptId) => {
    setDepartmentId(deptId);
    setEmployeeId(""); // Reset employee selection
    fetchEmployees(deptId);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, Word document, or text file",
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }

      setAttachment(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title || !description || !priorityId || !departmentId || !employeeId || !attachment) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and upload a contract before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create the contract review ticket
      const ticketResponse = await axios.post(
        `${apiUrl}/api/v1/tickets`,
        {
          title,
          description,
          priority_id: priorityId,
          category_id: 2, // Hardcoded to 2 for legal services
          assigned_to: employeeId,
        },
        { withCredentials: true }
      );

      const ticketId = ticketResponse?.data?.ticket_id;
      if (!ticketId) {
        throw new Error("Invalid response structure: Missing ticket_id");
      }

      // Upload the attachment
      const formData = new FormData();
      formData.append("attachment", attachment);

      try {
        await axios.post(
          `${apiUrl}/api/v1/tickets/${ticketId}/attachments`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
            // Add upload progress tracking
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`Upload Progress: ${percentCompleted}%`);
            },
          }
        );
      } catch (attachmentError) {
        console.error("Error uploading attachment:", attachmentError);
        toast({
          title: "Attachment Upload Failed",
          description: "Contract review request was created but the attachment failed to upload.",
          variant: "destructive",
        });
      }

      toast({
        title: "Success",
        description: "Contract review request submitted successfully.",
      });
      navigate("/contract-system");

      // Reset form
      setTitle("");
      setDescription("");
      setPriorityId("");
      setDepartmentId("");
      setEmployeeId("");
      setAttachment(null);
    } catch (error) {
      console.error("Error submitting contract review request:", error);
      toast({
        title: "Submission Error",
        description: error.response?.data?.message || "Failed to submit the contract review request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-lg">
      <CardHeader>
        <div className="flex justify-center items-center">
          <CardTitle className="text-2xl font-bold">Submit a Contract Review Request</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Contract Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter contract title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Review Details
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the contract and any specific review requirements..."
              rows={6}
            />
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1">
              Priority
            </label>
            <Select onValueChange={setPriorityId} value={priorityId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.id} value={priority.id.toString()}>
                    {priority.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium mb-1">
              Department
            </label>
            <Select onValueChange={handleDepartmentChange} value={departmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
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

          {/* Employee */}
          {departmentId && (
            <div>
              <label htmlFor="employee" className="block text-sm font-medium mb-1">
                Assign to Legal Reviewer
              </label>
              <Select onValueChange={setEmployeeId} value={employeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a legal reviewer" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter(employee => isAdmin || employee.employeeRole?.permissions?.isAdmin !== "True")
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} ({employee.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Attachment */}
          <div>
            <label htmlFor="attachment" className="block text-sm font-medium mb-1">
              Upload Contract (Required)
            </label>
            <Input
              id="attachment"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className="mb-2"
              required
            />
            {attachment && <FilePreview file={attachment} />}
          </div>

          <Button type="submit" className="w-full">
            Submit Contract Review Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContractReviewForm;

