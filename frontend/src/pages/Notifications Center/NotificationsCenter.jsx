import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OrdersTable from "./OrdersTable";
import ContractsTable from "./ContractsTable";
import SignaturesTable from "./SignaturesTable";
import ExpiringDocuments from "./ExpiringDocuments";

export default function NotificationsCenter() {
  const { t, i18n } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_URL;

  // States for Orders Logs
  const [ordersLogs, setOrdersLogs] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState(null);

  // States for Documents Logs
  const [documentsLogs, setDocumentsLogs] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [errorDocuments, setErrorDocuments] = useState(null);

  // States for Signatures Logs
  const [signaturesLogs, setSignaturesLogs] = useState([]);
  const [loadingSignatures, setLoadingSignatures] = useState(false);
  const [errorSignatures, setErrorSignatures] = useState(null);

  // State for Expiring Documents
  const [expiringData, setExpiringData] = useState([]);
  const [loadingExpiring, setLoadingExpiring] = useState(false);
  const [errorExpiring, setErrorExpiring] = useState(null);

  // New state for Contracts Logs
  const [contractsLogs, setContractsLogs] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [errorContracts, setErrorContracts] = useState(null);

  useEffect(() => {
    const fetchOrdersLogs = async () => {
      try {
        setLoadingOrders(true);
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${apiUrl}/api/v1/audit-logs/orders`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (response.data.status === "success") {
          setOrdersLogs(response.data.data);
        } else {
          throw new Error(t("fetchOrdersError"));
        }
      } catch (err) {
        setErrorOrders(
          err.response?.data?.message || err.message || t("unexpectedError")
        );
        console.error("Error fetching orders logs:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchDocumentsLogs = async () => {
      try {
        setLoadingDocuments(true);
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${apiUrl}/api/v1/audit-logs/documents`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (response.data.status === "success") {
          setDocumentsLogs(response.data.data);
        } else {
          throw new Error(t("fetchDocumentsError"));
        }
      } catch (err) {
        setErrorDocuments(
          err.response?.data?.message || err.message || t("unexpectedError")
        );
        console.error("Error fetching documents logs:", err);
      } finally {
        setLoadingDocuments(false);
      }
    };

    const fetchSignaturesLogs = async () => {
      try {
        setLoadingSignatures(true);
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${apiUrl}/api/v1/audit-logs/signatures`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (response.data.status === "success") {
          setSignaturesLogs(response.data.data);
        } else {
          throw new Error(t("fetchSignaturesError"));
        }
      } catch (err) {
        setErrorSignatures(
          err.response?.data?.message || err.message || t("unexpectedError")
        );
        console.error("Error fetching signatures logs:", err);
      } finally {
        setLoadingSignatures(false);
      }
    };

    const fetchContractsLogs = async () => {
      try {
        setLoadingContracts(true);
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${apiUrl}/api/v1/audit-logs/sales-contracts`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (response.data.status === "success") {
          setContractsLogs(response.data.data.logs);
        } else {
          throw new Error(t("fetchContractsError"));
        }
      } catch (err) {
        setErrorContracts(
          err.response?.data?.message || err.message || t("unexpectedError")
        );
        console.error("Error fetching contracts logs:", err);
      } finally {
        setLoadingContracts(false);
      }
    };

    fetchOrdersLogs();
    fetchDocumentsLogs();
    fetchSignaturesLogs();
    fetchContractsLogs();
  }, [apiUrl, t]);

  useEffect(() => {
    const processExpiringDocuments = () => {
      try {
        setLoadingExpiring(true);
        const currentDocuments = processAuditLogs(documentsLogs, "document_id");
        const lastOperationMap = new Map();
        documentsLogs.forEach((log) => {
          const entityId = log.document_id;
          if (!entityId) return;
          if (!lastOperationMap.has(entityId)) {
            lastOperationMap.set(entityId, log);
          } else {
            const existingLog = lastOperationMap.get(entityId);
            if (new Date(log.timestamp) > new Date(existingLog.timestamp)) {
              lastOperationMap.set(entityId, log);
            }
          }
        });

        const expiringDocuments = currentDocuments
          .filter((doc) => {
            try {
              const details = JSON.parse(doc.details);
              const expiryDate = details.expiryDate ? new Date(details.expiryDate) : null;
              if (!expiryDate) return false;
              const now = new Date();
              const oneMonthFromNow = new Date();
              oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
              return expiryDate <= oneMonthFromNow && expiryDate >= now;
            } catch (error) {
              return false;
            }
          })
          .map((doc) => {
            const lastLog = lastOperationMap.get(doc.id);
            const action = lastLog ? lastLog.operation_type : "N/A";
            return {
              ...doc,
              action,
            };
          });

        setExpiringData(expiringDocuments);
      } catch (err) {
        setErrorExpiring(t("processExpiringError"));
        console.error("Error processing expiring documents:", err);
      } finally {
        setLoadingExpiring(false);
      }
    };

    if (documentsLogs.length > 0) {
      processExpiringDocuments();
    }
  }, [documentsLogs, t]);

  const processAuditLogs = (logs, entityKey) => {
    const entitiesMap = new Map();
    const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    sortedLogs.forEach((log) => {
      const { operation_type, new_data, old_data } = log;
      if (!new_data && operation_type !== "DELETE") return;

      const entityId = new_data ? new_data.id : old_data.id;

      switch (operation_type) {
        case "CREATE":
          entitiesMap.set(entityId, new_data);
          break;
        case "UPDATE":
          if (entitiesMap.has(entityId)) {
            entitiesMap.set(entityId, { ...entitiesMap.get(entityId), ...new_data });
          } else {
            entitiesMap.set(entityId, new_data);
          }
          break;
        case "DELETE":
          entitiesMap.delete(entityId);
          break;
        default:
          break;
      }
    });

    return Array.from(entitiesMap.values());
  };

  const signaturesData = signaturesLogs.map((sig) => ({
    ...sig,
    dateSigned: sig.timestamp ? new Date(sig.timestamp).toLocaleDateString() : t("notAvailable"),
    email: sig.signer_email || t("notAvailable"),
  }));

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("notificationsCenter")}</h1>
      </div>
      <Tabs defaultValue="orders" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="orders">{t("ordersTab")}</TabsTrigger>
          <TabsTrigger value="contracts">{t("contractsTab")}</TabsTrigger>
          <TabsTrigger value="signatures">{t("signaturesTab")}</TabsTrigger>
          <TabsTrigger value="expiring">{t("expiringTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>{t("ordersTitle")}</CardTitle>
              <CardDescription>{t("ordersDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingOrders && <p>{t("loadingOrders")}</p>}
              {errorOrders && <p className="text-red-500">{t("error", { error: errorOrders })}</p>}
              {!loadingOrders && !errorOrders && <OrdersTable data={ordersLogs} />}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>{t("contractsTitle")}</CardTitle>
              <CardDescription>{t("contractsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingContracts && <p>{t("loadingContracts")}</p>}
              {errorContracts && <p className="text-red-500">{t("error", { error: errorContracts })}</p>}
              {!loadingContracts && !errorContracts && <ContractsTable data={contractsLogs} />}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signatures">
          <Card>
            <CardHeader>
              <CardTitle>{t("signaturesTitle")}</CardTitle>
              <CardDescription>{t("signaturesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSignatures && <p>{t("loadingSignatures")}</p>}
              {errorSignatures && <p className="text-red-500">{t("error", { error: errorSignatures })}</p>}
              {!loadingSignatures && !errorSignatures && <SignaturesTable data={signaturesData} />}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expiring">
          <Card>
            <CardHeader>
              <CardTitle>{t("expiringTitle")}</CardTitle>
              <CardDescription>{t("expiringDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingExpiring && <p>{t("loadingExpiring")}</p>}
              {errorExpiring && <p className="text-red-500">{t("error", { error: errorExpiring })}</p>}
              {!loadingExpiring && !errorExpiring && <ExpiringDocuments data={expiringData} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}