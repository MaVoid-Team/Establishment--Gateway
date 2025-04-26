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
import { Pagination } from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ContractSystem = () => {
  const { t, i18n } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(5);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    const fetchUserDataAndTickets = async () => {
      try {
        // Fetch user data to check admin status
        const userResponse = await axios.get(`${apiUrl}/api/v1/employees/myData`, {
          withCredentials: true,
        });
        const userData = userResponse.data.data.employee;
        const isAdminRole = userData.employeeRole.permissions.isAdmin === "True" || userData.employeeRole.permissions.isAdmin === true;
        setIsAdmin(isAdminRole);

        // Fetch tickets based on admin status
        let ticketsResponse;
        if (isAdminRole) {
          ticketsResponse = await axios.get(`${apiUrl}/api/v1/tickets/category/2`, {
            withCredentials: true,
          });
        } else {
          ticketsResponse = await axios.get(`${apiUrl}/api/v1/tickets/getmytickets/2`, {
            withCredentials: true,
          });
        }

        const fetchedTickets = ticketsResponse.data.tickets || [];
        setTickets(fetchedTickets);
        setFilteredTickets(fetchedTickets);

        // Calculate stats
        const open = fetchedTickets.filter(
          (ticket) => ticket.status.status_name.toLowerCase() === "open"
        ).length;
        const inProgress = fetchedTickets.filter(
          (ticket) => ticket.status.status_name.toLowerCase() === "in progress"
        ).length;
        const resolved = fetchedTickets.filter(
          (ticket) => ticket.status.status_name.toLowerCase() === "resolved"
        ).length;

        setStats({ open, inProgress, resolved });
      } catch (error) {
        console.error(t("error.fetchUserDataAndTickets"), error);
      }
    };

    fetchUserDataAndTickets();
  }, [apiUrl, t]);

  useEffect(() => {
    let filtered = [...tickets];

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (ticket) => ticket.status.status_name.toLowerCase() === filterStatus
      );
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("contractSystem.heading")}</h1>
          <p className="text-sm pt-4 pb-4">
            {t("contractSystem.description")}
          </p>
        </div>
        <Button onClick={() => navigate("/submit-contract-review")}>
          {t("contractSystem.submitButton")}
        </Button>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pt-4">
          <Card className="shadow-lg hover:shadow-xl dark:shadow-black border-none transition-all duration-300 ease-in-out">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                {t("contractSystem.stats.openTickets")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.open}</div>
              <p className="text-sm text-muted-foreground">
                {t("contractSystem.stats.openDescription")}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl dark:shadow-black border-none transition-all duration-300 ease-in-out">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                {t("contractSystem.stats.inProgressTickets")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.inProgress}</div>
              <p className="text-sm text-muted-foreground">
                {t("contractSystem.stats.inProgressDescription")}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl dark:shadow-black border-none transition-all duration-300 ease-in-out">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                {t("contractSystem.stats.resolvedTickets")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.resolved}</div>
              <p className="text-sm text-muted-foreground">
                {t("contractSystem.stats.resolvedDescription")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          type="search"
          placeholder={t("contractSystem.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select onValueChange={setFilterStatus} dir={i18n.language==="ar" ? "rtl" : "ltr"}>
          <SelectTrigger>
            <SelectValue placeholder={t("contractSystem.filterPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("contractSystem.filterOptions.all")}</SelectItem>
            <SelectItem value="open">{t("contractSystem.filterOptions.open")}</SelectItem>
            <SelectItem value="in progress">{t("contractSystem.filterOptions.inProgress")}</SelectItem>
            <SelectItem value="resolved">{t("contractSystem.filterOptions.resolved")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("contractSystem.table.ticketId")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("contractSystem.table.title")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("contractSystem.table.category")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("contractSystem.table.status")}</TableHead>
            <TableHead className={`${i18n.language === "ar" ? "text-right" : "text-left"}`}>{t("contractSystem.table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentTickets.map((ticket) => (
            <TableRow key={ticket.ticket_id}>
              <TableCell>#{ticket.ticket_id}</TableCell>
              <TableCell>{ticket.title}</TableCell>
              <TableCell>{ticket.category.category_name}</TableCell>
              <TableCell>
                <Badge
                  className={
                    ticket.status.status_name.toLowerCase() === "open"
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : ticket.status.status_name.toLowerCase() === "in progress"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-green-500 hover:bg-green-600"
                  }
                >
                  {t(`contractSystem.status.${ticket.status.status_name.toLowerCase()}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/view-ticket/${ticket.ticket_id}`)}
                >
                  {t("contractSystem.table.view")}
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

export default ContractSystem;

