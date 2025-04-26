import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Pagination } from '../../components/ui/pagination'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const ITEMS_PER_PAGE = 5;

function ViewCompanies() {
  const [companies, setCompanies] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const apiUrl = import.meta.env.VITE_API_URL
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${apiUrl}/api/v1/companies`, {withCredentials: true})
        if (response.data.status === 'success') {
          setCompanies(response.data.data.companies)
        } else {
          console.error(t('FailedToFetchCompanies'))
        }
      } catch (error) {
        console.error(t('ErrorFetchingCompanies'), error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()
  }, [apiUrl, t])

  const handleChange = (event) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  const filteredCompanies = useMemo(() => {
    return companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.phone_number.includes(searchTerm)
    )
  }, [companies, searchTerm])

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE)

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredCompanies, currentPage])

  return (
    <div className="min-h-{80vh} bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Search Section */}
        <div className="bg-background mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("SearchForCompanies")}
                value={searchTerm}
                onChange={handleChange}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </div>

        {/* Companies List Section */}
        <div>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <h2 className="text-3xl font-bold sm:mb-0">{t("Companies")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("TotalCompanies")}: {filteredCompanies.length} | {t("Page")}: {currentPage} / {totalPages}
            </p>
          </div>

          {/* Company List */}
          <div className="space-y-4" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
            {isLoading ? (
              <p>{t("Loading")}</p>
            ) : paginatedCompanies.length > 0 ? (
              paginatedCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-xl shadow-lg dark:shadow-black transition-all duration-500 hover:scale-105 border-none">
                  <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4">
                    <div className="flex flex-col mb-4 sm:mb-0">
                      <h3 className="font-medium">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">{company.email}</p>
                      <p className="text-sm text-muted-foreground">{company.phone_number}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                      <p className="text-sm">{t("CR")}: {company.cr}</p>
                      <p className="text-sm">{t("VAT")}: {company.vat}</p>
                      <Button variant="outline" onClick={() => navigate(`/company/${company.id}`)} className='hover:bg-[#d4ab71]'>
                        {t("ViewProfile")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>{t("NoCompaniesFound")}</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewCompanies

