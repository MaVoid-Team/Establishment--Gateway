import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const rolePermissions = {
  employee:           ["all"], 
  common_services:    ["all", "everyoneButEmployee"],
  direct_manager:     ["all", "everyoneButEmployee", "managerPlus" ,], 
  monetary:           ["all", "everyoneButEmployee", "managerPlus", "monetaryCeoAdmin"],
  ceo:                ["all", "everyoneButEmployee", "managerPlus", "monetaryCeoAdmin", "ceoAdmin"],
  admin:              ["all", "everyoneButEmployee", "managerPlus", "monetaryCeoAdmin", "ceoAdmin", "adminOnly"],
};

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [permissions, setPermissions] = useState([]);
  
    const checkAuth = useCallback(async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/employees/myData`, {
          withCredentials: true,
        });

        setIsAuthenticated(true);

        const roleName = response?.data?.data?.employee?.employeeRole?.name;
        const role =
          roleName === "direct manager"
            ? "direct_manager"
            : roleName?.replace(/[']/g, "").trim().toLowerCase() || "employee";

        setUserRole(role);
        setPermissions(rolePermissions[role] || []);
      } catch (error) {
        if (error?.response?.status !== 401) {
          console.error("Failed to fetch user data:", error);
        }
        setIsAuthenticated(false);
        setUserRole(null);
        setPermissions([]);
      }
    }, []);

    useEffect(() => {
      checkAuth();
    }, [checkAuth]);
  
    return {
      isAuthenticated,
      userRole,
      permissions,
      isLoading: isAuthenticated === null,
      checkAuth,
    };
  }

