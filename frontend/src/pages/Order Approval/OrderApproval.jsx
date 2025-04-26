import { useState, useEffect, useCallback } from "react";
import { CalendarIcon, CreditCard, Package, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

/** Priority color mapping (example) */
const priorityColors = {
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
  "Very Low": "bg-blue-500",
};

/** 
 * Displays a colored badge based on priority 
 * (In your example, you named it OrderApproval)
 */
function OrderApproval({ priority }) {
  const { t } = useTranslation();
  return (
    <Badge
      className={`${priorityColors[priority] || "bg-gray-500"} text-white`}
    >
      {priority || t("regular")}
    </Badge>
  );
}

export default function Component() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [companies, setCompanies] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dateCreated");
  const [filterPriority, setFilterPriority] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Your API base URL from Vite env:
  const apiUrl = import.meta.env.VITE_API_URL;

  /**
   * 1. Wrap fetching logic in a reusable function using useCallback 
   *    so we can call it anytime we need to refresh the data.
   */
  const fetchOrdersAndCompanies = useCallback(async () => {
    setLoading(true);

    try {
      // Fetch orders
      const ordersResponse = await axios.get(
        `${apiUrl}/api/v1/orders/awaitedOrders`,
        { withCredentials: true }
      );

      // The API response structure
      const ordersData = ordersResponse.data;
      console.log("Orders response data:", ordersData);

      // Check if orders are present
      if (ordersData?.data?.orders) {
        setOrders(ordersData.data.orders);
      } else {
        console.error("Orders data is missing or malformed:", ordersData);
        setOrders([]); // fallback if data is malformed
      }

      // Fetch companies for each unique company_id
      const companyIds = ordersData?.data?.orders?.map((order) => order.company_id);
      const uniqueCompanyIds = [...new Set(companyIds)];

      const companyPromises = uniqueCompanyIds.map((companyId) =>
        axios
          .get(`${apiUrl}/api/v1/companies/${companyId}`, {
            withCredentials: true,
          })
          .then((res) => res.data)
      );

      const companyData = await Promise.all(companyPromises);

      // Convert array of company data to an object: { [id]: company }
      const companiesObj = companyData.reduce((acc, company) => {
        acc[company.data.company.id] = company.data.company;
        return acc;
      }, {});

      setCompanies(companiesObj);
    } catch (error) {
      console.error("Error fetching orders or companies:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  /**
   * 2. Use the function in useEffect to fetch data on component mount
   */
  useEffect(() => {
    fetchOrdersAndCompanies();
  }, [fetchOrdersAndCompanies]);

  // Optional: Debug orders
  useEffect(() => {
    console.log("Orders state:", orders);
  }, [orders]);

  /**
   * 3. Filter and sort orders
   */
  const filteredAndSortedOrders = orders
    .filter((order) => {
      const orderTitleMatch = order.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const orderIdMatch = order.id
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const priorityMatch =
        filterPriority === "all" || order.orderPriority === filterPriority;

      return (orderTitleMatch || orderIdMatch) && priorityMatch;
    })
    .sort((a, b) => {
      if (sortBy === "dateCreated") {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB.getTime() - dateA.getTime(); // descending order
      } else if (sortBy === "price") {
        return b.price - a.price; // descending by price
      } else {
        return 0;
      }
    });

  /**
   * 4. Approve or Decline order
   *    - After the PUT request, call `fetchOrdersAndCompanies()` again
   *      to refresh the data from the server.
   */
  const handleApprove = async (orderId) => {
    try {
      const response = await axios.patch(
        `${apiUrl}/api/v1/orders/${orderId}`,
        { decision: "approved" },
        { withCredentials: true }
      );
      console.log(`Order ${orderId} approved successfully`, response.data);

      // Re-fetch all orders after approval
      await fetchOrdersAndCompanies();

      // Optionally navigate
      // navigate("/order-approval");
    } catch (error) {
      console.error(`Error approving order ${orderId}:`, error);
    }
  };

  const handleDecline = async (orderId) => {
    try {
      const response = await axios.patch(
        `${apiUrl}/api/v1/orders/${orderId}`,
        { decision: "rejected" },
        { withCredentials: true }
      );
      console.log(`Order ${orderId} declined successfully`, response.data);

      // Re-fetch all orders after decline
      await fetchOrdersAndCompanies();

      // Optionally navigate
      // navigate("/order-approval");
    } catch (error) {
      console.error(`Error declining order ${orderId}:`, error);
    }
  };

  /**
   * 5. Render the UI
   */
  return (
    <div className="container mx-auto p-10 space-y-6">
      <h1 className="text-3xl font-bold mb-6">
        {t("ordersAwaitingApproval")}
      </h1>

      {/* Searching and Filtering */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="text"
            placeholder={t("searchOrders")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Sort by */}
        <Select
          value={sortBy}
          onValueChange={setSortBy}
          dir={i18n.language === "ar" ? "rtl" : "ltr"}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dateCreated">{t("dateCreated")}</SelectItem>
            <SelectItem value="price">{t("price")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Priority */}
        <Select
          value={filterPriority}
          onValueChange={setFilterPriority}
          dir={i18n.language === "ar" ? "rtl" : "ltr"}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("filterByPriority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allPriorities")}</SelectItem>
            <SelectItem value="Critical">{t("critical")}</SelectItem>
            <SelectItem value="High">{t("high")}</SelectItem>
            <SelectItem value="Medium">{t("medium")}</SelectItem>
            <SelectItem value="Low">{t("low")}</SelectItem>
            <SelectItem value="Very Low">{t("veryLow")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {loading ? (
        <p>{t("loading")}...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedOrders.map((order) => {
            const company = companies[order.company_id];

            return (
              <Card
                key={order.id}
                className="flex flex-col rounded-lg border-none shadow-lg hover:shadow-xl dark:shadow-black/30 hover:scale-105 transition-all duration-300 ease-in-out"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{order.title}</span>
                    <OrderApproval
                      priority={order.orderPriority || t("regular")}
                    />
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-4">
                    {order.description}
                  </p>
                  <div className="space-y-2">
                    {/* Order ID */}
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">
                        <strong>{t("orderId")}:</strong> {order.id}
                      </span>
                    </div>
                    {/* Employee ID/Name */}
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        <strong>{t("employeeNameAndId")}:</strong>{" "}
                        {order.employee_id}
                      </span>
                    </div>
                    {/* Price */}
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        <strong>{t("price")}:</strong> SAR{" "}
                        {order.price.toFixed(2)}
                      </span>
                    </div>
                    {/* Estimated Time */}
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        <strong>{t("estimatedTime")}:</strong>{" "}
                        {new Date(order.estimated_time).toLocaleDateString()}
                      </span>
                    </div>
                    {/* Notes */}
                    <div className="mt-4">
                      <h3 className="font-medium">{t("notes")}:</h3>
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                  {/* Company Info */}
                  <div className="text-sm">
                    <h3 className="font-medium mb-2">
                      {t("companyInformation")}
                    </h3>
                    <p>
                      <strong>{t("name")}:</strong> {company?.name}
                    </p>
                    <p>
                      <strong>{t("phone")}:</strong> {company?.phone_number}
                    </p>
                    <p>
                      <strong>{t("email")}:</strong> {company?.email}
                    </p>
                  </div>
                  {/* Actions */}
                  <div>
                    <div className="space-x-4">
                      <Button
                        className="bg-green-500"
                        variant="outline"
                        onClick={() => handleApprove(order.id)}
                      >
                        {t("approve")}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDecline(order.id)}
                      >
                        {t("decline")}
                      </Button>
                    </div>
                    <div className="gap-2 bg-card rounded-lg mt-4">
                      <Button
                        className="w-full px-6"
                        variant="default"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        {t("View Details")}
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
