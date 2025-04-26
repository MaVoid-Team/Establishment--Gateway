'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { is } from 'date-fns/locale'

const supportContent = [
  {
    id: 'getting-started',
    titleKey: 'support.getting_started.title',
    videoId: 'D5KgMKDkWE4',
    arVideoId: 'JaRq44cY_ak',
    contentKey: 'support.getting_started.content',
  },
  {
    id: 'contracts',
    titleKey: 'support.contracts.title',
    videoId: 'jR881X6dXLw',
    arVideoId: 'XTN0BYXWft8',
    contentKey: 'support.contracts.content',
  },
  {
    id: 'profile',
    titleKey: 'support.profile.title',
    videoId: 'xgIhrTjWJ0Q',
    arVideoId: 'qT1YvLrOG5o',
    contentKey: 'support.profile.content',
  },
  {
    id: 'departments',
    titleKey: 'support.departments.title',
    videoId: 'pq8ncpi3Egc',
    arVideoId: '-f8xs7BFKA0',
    contentKey: 'support.departments.content',
  },
  {
    id: 'sales-contracts',
    titleKey: 'support.sales_contracts.title',
    videoId: 'gJtwDD7gePw',
    arVideoId: 'pNQJcLvl4Mo',
    contentKey: 'support.sales_contracts.content',
  },
  {
    id: 'legal-services',
    titleKey: 'support.legal_services.title',
    videoId: 'd9EzOk2frbE',
    arVideoId: 'ITlzrq1yKDU',
    contentKey: 'support.legal_services.content',
  },
  {
    id: 'maintenance',
    titleKey: 'support.maintenance.title',
    videoId: '',
    arVideoId: 'lOELPQdGFiQ',
    contentKey: 'support.maintenance.content',
  },
  {
    id: 'contacts',
    titleKey: 'support.contacts.title',
    videoId: '5kKihXmrmRs',
    arVideoId: 'Rhwn2xubin4',
    contentKey: 'support.contacts.content',
  },
  {
    id: 'notifications-center',
    titleKey: 'support.notifications_center.title',
    videoId: 'NInoVfrb8i8',
    arVideoId: 'YS0GSQtFReE',
    contentKey: 'support.notifications_center.content',
  },
  {
    id: 'admin-dashboard',
    titleKey: 'support.admin_dashboard.title',
    videoId: '',
    arVideoId: '-ZXL9r_6S9s',
    contentKey: 'support.admin_dashboard.content',
  },
  {
    id: 'signatures-history',
    titleKey: 'support.signatures_history.title',
    videoId: 'tuAmgwFQ-3s',
    arVideoId: 'ECzequaosgc',
    contentKey: 'support.signatures_history.content',
  },
  {
    id: 'settings',
    titleKey: 'support.settings.title',
    videoId: 'TI4BEyWLbGs',
    arVideoId: '7LG0S9SdsQI',
    contentKey: 'support.settings.content',
  }
]

export default function Support() {
  const [activeContent, setActiveContent] = useState(supportContent[0].id)
  const [isArabic, setIsArabic] = useState(false)
  const { t,i18n } = useTranslation()

  const selectedContent = supportContent.find(item => item.id === activeContent)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('support.title')}</h1>
        <div className="flex gap-1 bg-yellow-200/5 p-1.5 rounded-full shadow-orange-300 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full px-4 transition-all duration-300 ${
              !isArabic 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105 border border-yellow-300'
                : 'bg-white/70 dark:bg-gray-600/10 hover:bg-white dark:hover:bg-gray-500/20 hover:scale-95 border-transparent'
            }`}
            onClick={() => setIsArabic(false)}
          >
            <span className="font-bold tracking-wide">{t('language.en')}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full px-4 transition-all duration-300 ${
              isArabic 
                ? 'bg-gradient-to-l from-yellow-500 to-amber-200 text-white shadow-lg scale-105 border border-yellow-300'
                : 'bg-white/70 dark:bg-gray-600/10 hover:bg-white dark:hover:bg-gray-500/20 hover:scale-95 border-transparent'
            }`}
            onClick={() => setIsArabic(true)}
          >
            <span className="font-bold tracking-wide">{t('language.ar')}</span>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <TableOfContents 
          contents={supportContent} 
          activeContent={activeContent} 
          setActiveContent={setActiveContent}
          isArabic={isArabic}
          t={t}
        />
        
        <div className="flex-grow">
          {selectedContent && (
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="w-full" style={{ paddingBottom: '56.25%', position: 'relative' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${isArabic ? selectedContent.arVideoId : selectedContent.videoId}`}
                  className="absolute top-0 left-0 w-full h-full border dark:border-yellow-800/30"
                  allowFullScreen
                />
              </div>
              <div className="p-6 dark:bg-transparent">
                <h2 className="text-2xl font-semibold mb-3">
                  {t(selectedContent.titleKey)}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(selectedContent.contentKey)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TableOfContents({ contents, activeContent, setActiveContent, t }) {
  const {i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  return (
    <nav className="w-full md:w-64 md:min-w-[16rem] md:max-w-[16rem] mb-8 md:mb-0">
      <h2 className="text-xl font-semibold mb-4">{t('support.toc')}</h2>
      <ul className="space-y-2">
        {contents.map((item) => (
          <li key={item.id}>
            <button
              className={`flex items-center p-3 md:p-2.5 w-full text-left rounded-lg transition-all
                ${activeContent === item.id 
                  ? 'bg-blue-50 dark:bg-amber-900/20 border border-amber-200 dark:border-orange-500/20 dark:text-blue-200' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-100/15 border border-transparent'}
                text-sm md:text-base`}
              onClick={() => setActiveContent(item.id)}
            >
              <ChevronRight className={`w-4 h-4 mr-2 flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
              <span className="flex-1 truncate">{t(item.titleKey)}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}