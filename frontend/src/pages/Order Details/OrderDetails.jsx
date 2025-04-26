/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react"
import { CalendarIcon, CreditCard, FileText, Package, Trash2, Users, EditIcon, PrinterIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Link, useNavigate, useLocation, useParams } from "react-router-dom"
import axios from "axios"
import { useTranslation } from "react-i18next"
import { useToast } from "../../hooks/use-toast"

// --- Badge for final_status ---
const statusColors = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  work_in_progress: "bg-blue-500",
}

function StatusBadge({ status }) {
  const { t } = useTranslation()
  return (
    <Badge className={`${statusColors[status] || "bg-gray-500"} text-white capitalize`}>
      {t(status.replace(/_/g, " "))}
    </Badge>
  )
}

// --- Subcomponent: fetch & display 1 chain signer (except the first) ---
function ChainSignature({ employeeId, signedAt, apiUrl, t }) {
  const [employeeData, setEmployeeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchEmployee() {
      try {
        setLoading(true)
        const res = await axios.get(`${apiUrl}/api/v1/employees/${employeeId}`, {
          withCredentials: true,
        })
        setEmployeeData(res.data.data.employee)
      } catch (err) {
        setError(err.message || "Error fetching employee")
      } finally {
        setLoading(false)
      }
    }
    if (employeeId) {
      fetchEmployee()
    }
  }, [employeeId, apiUrl])

  if (loading) {
    return <p className="text-sm">{t("loading")}...</p>
  }
  if (error || !employeeData) {
    return <p className="text-sm text-red-500">{t("errorFetchingEmployee")}</p>
  }

  // If we have valid data, show the snippet
  const { signature, name, role_name } = employeeData
  return (
    <div className="flex flex-col items-center border p-3 rounded">
      <p className="text-xl font-semibold mb-2">{role_name}</p>
      {signature ? (
        <>
          <img
            src={signature || "/placeholder.svg"}
            alt={t("orderSignature")}
            className="w-48 h-48 object-contain border rounded-md"
          />
          <p className="text-sm text-white/80  mt-2">
            {t("signedBy")}: {name}
          </p>
          {signedAt && (
            <p className="text-sm text-white/80 ">
              {t("signedAt")}: {new Date(signedAt).toLocaleString()}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm">{t("noSignatureAvailable")}</p>
      )}
    </div>
  )
}

// --- Main Component ---
const apiUrl = import.meta.env.VITE_API_URL

export default function OrderDetailsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { state } = useLocation()
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(state?.order || null)
  const [employee, setEmployee] = useState(null)

  const [loadingOrder, setLoadingOrder] = useState(!state?.order)
  const [loadingEmployee, setLoadingEmployee] = useState(false)
  const [error, setError] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  const [isAdmin, setIsAdmin] = useState(false)
  const [userRole, setUserRole] = useState("")

  // This is the "first" chain signature => we skip it in the chain
  const [signature, setSignature] = useState(null)

  // --- Fetch the order + first chain signature from order.signatures[0] (or wherever) ---
  useEffect(() => {
    async function fetchOrderData() {
      try {
        setLoadingOrder(true)
        const response = await axios.get(`${apiUrl}/api/v1/orders/${id}`, {
          withCredentials: true,
        })

        if (response.data.status === "success") {
          const orderData = response.data.data.order
          setOrder(orderData)

          // The snippet (the first chain) -> here it's stored in order.signatures[0]
          if (orderData.signatures && orderData.signatures.length > 0) {
            setSignature(orderData.signatures[0])
          } else {
            setSignature(null)
          }
        } else {
          setError(t("failedToFetchOrderDetails"))
        }
      } catch (err) {
        setError(t("errorFetchingOrderDetails"))
        console.error("Error fetching order:", err.response || err)
      } finally {
        setLoadingOrder(false)
      }
    }
    if (id) {
      fetchOrderData()
    }
  }, [id, t])

  // --- Fetch the employee who created the order ---
  useEffect(() => {
    async function fetchEmployeeData() {
      if (order && order.employee_id) {
        try {
          setLoadingEmployee(true)
          const res = await axios.get(`${apiUrl}/api/v1/employees/${order.employee_id}`, {
            withCredentials: true,
          })
          if (res.data.status === "success") {
            const fetchedEmployee = res.data.data.employee
            setEmployee(fetchedEmployee)

            const roleName = fetchedEmployee.employeeRole?.name
            const cleanRoleName = roleName?.replace(/[`']/g, "").trim().toLowerCase()

            setUserRole(cleanRoleName || "employee")
            setIsAdmin(cleanRoleName === "admin")
          } else {
            setError(t("failedToFetchEmployeeDetails"))
          }
        } catch (err) {
          console.error("Failed to fetch employee data:", err)
          setError(t("errorFetchingEmployeeDetails"))
          setUserRole("employee")
          setIsAdmin(false)
        } finally {
          setLoadingEmployee(false)
        }
      }
    }
    fetchEmployeeData()
  }, [order, t])

  // --- Flatten the chain, but SKIP the first item ---
  // Because you said the first item is "literally" the same as the snippet
  // So we'll start from index 1
  const restChainSigners = []
  if (order?.approval_chain && Array.isArray(order.approval_chain)) {
    const chainToProcess = order.approval_chain.slice(1) // skip first item
    chainToProcess.forEach((item) => {
      restChainSigners.push({
        employeeId: item.employee_id,
        signedAt: item.timestamp,
      })})
  }

  // --- Handlers ---

  const handlePrint = () => {
    navigate(`/orders/${id}/print`);
  };

  const handleEditOrder = () => {
    navigate(`/order/${order.id}/edit`, { state: { order } })
  }

  const handleDeleteOrder = async () => {
    try {
      if (!id) throw new Error(t("orderIDUndefined"))
      await axios.delete(`${apiUrl}/api/v1/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      })
      toast({
        title: t("orderDeleted"),
        description: t("orderDeletedDescription") || "Order deleted successfully!",
      })
      navigate("/order-history")
    } catch (err) {
      console.error("Error deleting order:", err)
      if (err.response) {
        const status = err.response.status
        let message = t("failedToDeleteOrderTryAgain")
        if (status === 401) {
          message = t("notAuthorizedToDeleteOrder")
        } else if (status === 500) {
          message = t("serverErrorContactSupport")
        }
        toast({
          variant: "destructive",
          title: t("errorOccurred"),
          description: message,
        })
      } else {
        toast({
          variant: "destructive",
          title: t("errorOccurred"),
          description: t("checkNetworkConnection"),
        })
      }
    }
  }

  // --- Wait for loading / handle errors
  const isLoading = loadingOrder || loadingEmployee
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">{t("loading")}...</div>
  }
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error || t("orderNotFound")}</p>
        <Button onClick={() => navigate(-1)}>{t("goBack")}</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-10 space-y-6">
      {/* Print-only Logo */}
      <div className="hidden print:flex print:justify-center print:mb-4">
        <img src="/images/logo.png" alt="Liwan Logo" className="w-48 h-auto" />
      </div>

      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="md:text-3xl font-bold text-xl">{t("orderDetails")}</h1>
        {isAdmin && (
          <div className="space-x-2 flex">
            <Button onClick={handleEditOrder}>
              <EditIcon className="w-4 h-4 mr-2" />
              {t("editOrder")}
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t("deleteOrder")}
            </Button>
          </div>
        )}
      </header>

      {/* Order Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t("orderOverview")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{t("orderTitle")}:</h3>
            <p className="capitalize">{order.title}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{t("orderDescription")}:</h3>
            <p>{order.description || t("noDescriptionAvailable")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Order Info & Employee Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t("orderInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{t("orderID")}:</span>
              <span>{order.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">{t("price")}:</span>
              <span>{order.price.toFixed(2)} SAR </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">{t("status")}:</span>
              <StatusBadge status={order.final_status} />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">{t("paymentMethod")}:</span>
              <span className="flex items-center gap-2 capitalize">
                <CreditCard className="h-4 w-4 " />
                {t(order.payment_method)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("employeeInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">{t("employeeDetails")}:</h3>
              <div className="bg-muted p-3 rounded-md">
                <p className="font-medium capitalize">{employee ? employee.name : t("loading")}</p>
                <p className="text-sm text-muted-foreground">{employee ? employee.email : t("loading")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Notes */}
      <Card className="page-break-before">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("orderDetails")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{t("orderNotes")}:</h3>
            <p>{order.notes || t("noNotesAvailable")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Dates & Attachments */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {t("dates")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{t("dateCreated")}:</span>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("attachments")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.attachment && order.attachment.length > 0 ? (
              order.attachment.map((file, index) => (
                <a
                  key={index}
                  href={`${apiUrl}${file.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline block mb-2"
                >
                  {file.path.split("/").pop()}
                </a>
              ))
            ) : (
              <p className="text-gray-500">{t("noAttachmentsAvailable")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Signatures */}
      <Card className="avoid-split">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("signatures")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {signature && (
              <div className="flex flex-col items-center border p-3 rounded">
                <p className="text-xl font-semibold mb-2">{t("orderSubmitter")}</p>
                <img
                    src={signature.signature_data || "/placeholder.svg"}
                    alt={t("orderSignature")}
                    className="w-48 h-48 object-contain border rounded-md"
                />
                <p className="text-sm text-white/80 mt-2">
                  {t("signedBy")}:{signature.signer_type === "employee" ? ` ${employee?.name}` : ` ${t("unknown")}`}
                </p>
                <p className="text-sm text-white/80">
                  {t("signedAt")}: {new Date(signature.signed_at).toLocaleString()}
                </p>
              </div>
            )}
            {restChainSigners.map((item, i) => (
              <ChainSignature key={i} employeeId={item.employeeId} signedAt={item.signedAt} apiUrl={apiUrl} t={t} 
              className="min-h-[200px]"/>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Print Button */}
      <div className="flex justify-center">
        <Button 
            onClick={handlePrint}
            className="no-print"
          >
            <PrinterIcon className="w-4 h-4 mr-2" />
            {t("print")}
          </Button>

      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteOrderConfirmation")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteOrderWarning")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder}>{t("delete")}</AlertDialogAction>
          </AlertDialogFooter>
          {deleteError && <p className="text-red-500 mt-2">{deleteError}</p>}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

