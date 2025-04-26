'use client'

import { useState, useEffect, useMemo } from "react"
import { useTranslation } from 'react-i18next';
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Filter, AlertCircle } from 'lucide-react'
import Widgets from "./Widgets"
import TableRowComponent from "./TableRowComponent"
import Pagination from "./Pagination"

export default function OrderHistory() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState([])
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  })
  const [dateError, setDateError] = useState("")
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)
  const [employees, setEmployees] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const ordersPerPage = 10
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/employees/myData`, {
          withCredentials: true,
        });
        if (response.data.status === "success") {
          setCurrentUser(response.data.data.employee);
          setIsAdmin(response.data.data.employee.employeeRole.permissions.isAdmin === "True");
        } else {
          console.error("Failed to fetch current user data:", response.data);
          setError("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching current user data:", error);
        setError("An error occurred while fetching user data");
      }
    };

    fetchCurrentUser();
  }, [apiUrl]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const endpoint = isAdmin ? `${apiUrl}/api/v1/orders` : `${apiUrl}/api/v1/employees/myOrders`;
        const response = await axios.get(endpoint, {
          withCredentials: true,
        });
        if (response.data.status === "success") {
          setOrders(response.data.data.orders);
  
          if (isAdmin) {
            const uniqueEmployeeIds = [
              ...new Set(response.data.data.orders.map((order) => order.employee_id)),
            ];
    
            const employeeDetails = {};
            await Promise.all(
              uniqueEmployeeIds.map(async (empId) => {
                try {
                  const empResponse = await axios.get(
                    `${apiUrl}/api/v1/employees/${empId}`,
                    { withCredentials: true }
                  );
                  if (empResponse.data.status === "success") {
                    employeeDetails[empId] = empResponse.data.data.employee;
                  }
                } catch (error) {
                  if (error.response?.status === 404) {
                    console.warn(`Employee with ID ${empId} not found (404).`);
                  } else {
                    console.error(`Error fetching employee ${empId}:`, error);
                  }
                }
              })
            );
    
            setEmployees(employeeDetails);
          }
        } else {
          console.error("Failed to fetch orders:", response.data);
          setError("Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("An error occurred while fetching orders");
      }
    };
  
    if (currentUser) {
      fetchOrders();
    }
  }, [apiUrl, isAdmin, currentUser]);

  const getEmployeeDisplay = (employeeId) => {
    const employee = employees[employeeId]
    if (employee) {
      return (
        <div className="flex flex-col items-center space-y-1">
          <span>{employee.name}</span>
        </div>
      )
    }
    return <span className="text-gray-400">Loading...</span>
  }

  const handleDateSelect = (range) => {
    if (range?.from && range?.to) {
      setDateError("")
      setDateRange({
        from: new Date(Math.min(range.from, range.to)),
        to: new Date(Math.max(range.from, range.to)),
      })
    } else if (range?.from) {
      setDateRange({ ...dateRange, from: range.from })
    } else if (range?.to) {
      setDateRange({ ...dateRange, to: range.to })
    } else {
      setDateRange({ from: undefined, to: undefined })
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toString().toLowerCase().includes(search.toLowerCase()) ||
        order.payment_method.toLowerCase().includes(search.toLowerCase()) ||
        order.final_status.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(order.final_status)

      const matchesPrice =
        (minPrice === "" || order.price >= parseFloat(minPrice)) &&
        (maxPrice === "" || order.price <= parseFloat(maxPrice))

      const orderDate = new Date(order.created_at)
      let matchesDate = true

      if (dateRange.from && dateRange.to) {
        matchesDate = orderDate >= dateRange.from && orderDate <= dateRange.to
      } else if (dateRange.from) {
        matchesDate = orderDate >= dateRange.from
      } else if (dateRange.to) {
        matchesDate = orderDate <= dateRange.to
      }

      return matchesSearch && matchesStatus && matchesPrice && matchesDate
    })
  }, [orders, search, statusFilter, minPrice, maxPrice, dateRange])

  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const statusCounts = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        const status = order.final_status || "Unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {
        pending: 0,
        approved: 0,
        rejected: 0,
        work_in_progress: 0,
        Unknown: 0,
      }
    )
  }, [orders])

  const statusMapping = {
    approved: "Approved",
    pending: "Pending Approval",
    rejected: "Rejected",
    work_in_progress: "Work In Progress",
  }

  const handleDelete = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`${apiUrl}/api/v1/orders/${orderId}`, {withCredentials: true})
        setOrders(orders.filter(order => order.id !== orderId))
      } catch (error) {
        console.error("Error deleting order:", error)
        setError("An error occurred while deleting the order")
      }
    }
  }

  const handleEdit = (order) => {
    // Implement edit functionality here
    console.log("Editing order:", order)
    // You might want to open a modal or navigate to an edit page
  }

  return (
    <div className="mx-auto py-10 w-full min-h-screen bg-no-repeat bg-cover">
      <div className="content container mx-auto p-10 ">
        <h1 className="text-3xl font-bold mb-2 text-shadow">{t('ordersHistory')}</h1>
        <p className="text-gray-600  dark:text-gray-200 mb-6 text-shadow">
          {t('ordersHistoryDescription')}
        </p>
        {isAdmin && <Widgets statusCounts={statusCounts} />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <Input
            className=" rounded-sm w-full border backdrop-blur-3xl shadow-lg dark:shadow-lg"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="backdrop-blur-3xl shadow-lg rounded-sm w-full bg-gradientBg">
                <Filter className="mr-2 h-4 w-4" />
                {t('filterStatus')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="backdrop-blur-3xl shadow-lg rounded-sm w-full border-hidden md:w-50 p-4 transition-all duration-300 ease-in-out hover:backdrop-blur-2xl">
              {Object.entries(statusMapping).map(([statusKey, displayName]) => (
                <DropdownMenuCheckboxItem
                  dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  key={statusKey}
                  checked={statusFilter.includes(statusKey)}
                  onCheckedChange={(checked) =>
                    setStatusFilter(
                      checked
                        ? [...statusFilter, statusKey]
                        : statusFilter.filter((s) => s !== statusKey)
                    )
                  }
                >
                  {t(statusKey)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="backdrop-blur-3xl shadow-lg rounded-sm w-full border-hidden">
                <Filter className="mr-2 h-4 w-4 " />
                {t('filterPrice')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="backdrop-blur-3xl shadow-lg rounded-sm w-full border-hidden md:w-80 p-4 transition-all duration-300 ease-in-out">
              <div className="flex flex-col space-y-2">
                <Input   
                  dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  placeholder={t('minPrice')}
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <Input
                  dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  placeholder={t('maxPrice')}
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="backdrop-blur-3xl shadow-lg rounded-sm w-full border-hidden">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {t('filterDate')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="backdrop-blur-3xl shadow-lg rounded-sm border-hidden w-auto p-0" align="start">
              {dateError && (
                <Alert variant="destructive" className="mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{dateError}</AlertDescription>
                </Alert>
              )}
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={handleDateSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center font-bold dark:text-primary/50">{t('orderId')}</TableHead>
                {isAdmin && <TableHead className="text-center font-bold dark:text-primary/50">{t('employee')}</TableHead>}
                <TableHead className="text-center font-bold dark:text-primary/50">{t('orderName')}</TableHead>
                <TableHead className="text-center font-bold dark:text-primary/50">{t('status')}</TableHead>
                <TableHead className="text-center font-bold dark:text-primary/50">{t('date')}</TableHead>
                <TableHead className="text-center font-bold dark:text-primary/50">{t('pricing')}</TableHead>
                <TableHead className="text-center font-bold dark:text-primary/50">{t('method')}</TableHead>
                <TableHead className="text-center font-bold dark:text-primary/50">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.map((order) => (
                <TableRowComponent
                  key={order.id}
                  order={order}
                  employeeDisplay={isAdmin ? getEmployeeDisplay(order.employee_id) : null}
                  isAdmin={isAdmin}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}