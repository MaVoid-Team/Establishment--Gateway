import { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Pagination } from "@/components/ui/pagination";
import { useTranslation } from "react-i18next";

const TicketSystem = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl"; // Improved RTL detection

  const [isAdmin, setIsAdmin] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(5);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    awaitingResponse: 0,
    unresolvedIssues: 0,
    resolvedTickets: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/employees/myData`, {
          withCredentials: true,
        });
        const isAdminRole =
          response.data?.data?.employee?.employeeRole?.permissions?.isAdmin;
        setIsAdmin(isAdminRole === "True" || isAdminRole === true);
        return isAdminRole === "True" || isAdminRole === true;
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        return false;
      }
    };

    const fetchTickets = async (adminStatus) => {
      try {
        const url = adminStatus
          ? `${apiUrl}/api/v1/tickets/category/1`
          : `${apiUrl}/api/v1/tickets/getmytickets/1`;

        const response = await axios.get(url, {
          withCredentials: true,
        });

        const fetchedTickets = response.data?.tickets || [];

        setTickets(fetchedTickets);
        setFilteredTickets(fetchedTickets);

        if (adminStatus) {
          const awaitingResponse = fetchedTickets.filter(
            (ticket) => ticket.status.status_name === "Open"
          ).length;
          const unresolvedIssues = fetchedTickets.filter(
            (ticket) =>
              ticket.status.status_name === "Open" ||
              ticket.status.status_name === "In Progress"
          ).length;
          const resolvedTickets = fetchedTickets.filter(
            (ticket) => ticket.status.status_name === "Resolved"
          ).length;

          setStats({ awaitingResponse, unresolvedIssues, resolvedTickets });
        }
      } catch (error) {
        console.error("Failed to fetch tickets data:", error);
      }
    };

    fetchUserData().then((adminStatus) => {
      setIsAdmin(adminStatus);
      fetchTickets(adminStatus);
    });
  }, [apiUrl]);

  useEffect(() => {
    let filtered = tickets;

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (ticket) =>
          ticket.status.status_name.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.creator.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, tickets]);

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Helper function to get badge color based on status
  const getBadgeColor = (statusName) => {
    switch (statusName) {
      case "Open":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "In Progress":
        return "bg-blue-500 hover:bg-blue-600";
      case "Resolved":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <div
      className={`p-10 ${isRTL ? "text-right" : "text-left"} ${
        isRTL ? "rtl" : ""
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 ">
        <div>
          <h1 className="text-3xl font-bold mb-2 ">{t("Maintenance Tickets Management")}</h1>
          <p className="text-sm pt-4 pb-8 ">
            {t(
              "Whenever you have any problems, please submit a ticket explaining your issues and it will be handled and taken care of."
            )}
          </p>
        </div>
        <Button onClick={() => navigate("/submit-a-ticket")}>
          {isAdmin ? t("Submit Ticket") : t("Submit Ticket")}
        </Button>
      </div>

      {/* Admin Stats Cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 ">
          <Card className="shadow-lg hover:shadow-xl border-none transition-all-ease-in-out duration-300">
            <CardHeader>
              <CardTitle>{t("Tickets Awaiting Response")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold ">{stats.awaitingResponse}</div>
              <p>{t("Tickets that are awaiting response from a manager or an admin.")}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl border-none transition-all-ease-in-out duration-300">
            <CardHeader>
              <CardTitle>{t("Unresolved Issues")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.unresolvedIssues}</div>
              <p>{t("Tickets that are unresolved and need attention.")}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl border-none transition-all-ease-in-out duration-300">
            <CardHeader>
              <CardTitle>{t("Resolved Tickets")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold backdrop-blur-lg transition-all-ease-in-out duration-300">{stats.resolvedTickets}</div>
              <p>{t("Tickets that have been successfully resolved.")}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 ">
        <Input className=""
          type="search"
          placeholder={t("Search by title or submitter...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          onValueChange={setFilterStatus}
          dir={isRTL ? "rtl" : "ltr"}
          className="col-span-1 md:col-span-2 backdrop-blur-lg transition-all-ease-in-out duration-300 border-none"
        >
          <SelectTrigger>
            <SelectValue placeholder={t("Filter by status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All")}</SelectItem>
            <SelectItem value="Open">{t("Open")}</SelectItem>
            <SelectItem value="In Progress">{t("In Progress")}</SelectItem>
            <SelectItem value="Resolved">{t("Resolved")}</SelectItem>
            {/* Add more status options if needed */}
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Table */}
      <Table className="backdrop-blur-md transition-all-ease-in-out duration-300 border-none hover:shadow-xl hover:backdrop-blur-2xl">
        <TableHeader>
          <TableRow>
            <TableHead className={`${isRTL ? "text-right " : ""}`}>{t("Ticket ID")}</TableHead>
            <TableHead className={`${isRTL ? "text-right" : ""}`}>{t("Title")}</TableHead>
            <TableHead className={`${isRTL ? "text-right" : ""}`}>{t("Submitter")}</TableHead>
            <TableHead className={`${isRTL ? "text-right" : ""}`}>{t("Date Submitted")}</TableHead>
            <TableHead className={`${isRTL ? "text-right" : ""}`}>{t("Status")}</TableHead>
            <TableHead className={`${isRTL ? "text-right" : ""}`}>{t("Actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentTickets.map((ticket) => (
            <TableRow key={ticket.ticket_id}>
              <TableCell>#{ticket.ticket_id}</TableCell>
              <TableCell>{ticket.title}</TableCell>
              <TableCell>{ticket.creator.name}</TableCell>
              <TableCell>
                {new Date(ticket.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge className={getBadgeColor(ticket.status.status_name)}>
                  {t(`ticketStatus.${ticket.status.status_name}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/view-ticket/${ticket.ticket_id}`)}
                >
                  {t("View")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredTickets.length}
        itemsPerPage={ticketsPerPage}
        onPageChange={paginate}
      />
    </div>
  );
};

export default TicketSystem;

