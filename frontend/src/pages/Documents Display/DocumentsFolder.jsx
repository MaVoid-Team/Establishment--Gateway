import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const FolderIcon = ({ title }) => (
  <div className="w-24 h-24 relative mb-4">
    <svg viewBox="0 0 100 100" className="w-full h-full bg-transparent ">
      <path
        d="M10,20 L40,20 L50,30 L90,30 L90,90 L10,90 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="transition-all duration-300 ease-in-out group-hover:stroke-[3] "
      />
      <text
        x="50"
        y="65"
        fontSize="24"
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
        className=" transition-all duration-300 ease-in-out group-hover:font-extrabold"
      >
        {title.slice(0, 2).toUpperCase()}
      </text>
    </svg>
  </div>
);

const HoverArrow = () => (
  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <svg className="w-6 h-6 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 11l5-5m0 0l5 5m-5-5v12" />
    </svg>
  </div>
);

export default function DocumentsDirectory() {
  const { t } = useTranslation(); // Initialize useTranslation
  const [folders, setFolders] = useState([]);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${apiUrl}/api/v1/documents/`, { withCredentials: true })
      .then(response => {
        const documents = response.data.data.documents;
        const groupedByType = documents.reduce((acc, doc) => {
          acc[doc.type] = (acc[doc.type] || 0) + 1;
          return acc;
        }, {});

        const folderData = Object.keys(groupedByType).map(type => ({
          title: type,
          documentCount: groupedByType[type],
        }));

        setFolders(folderData);
      })
      .catch(error => console.error('Error fetching documents:', error));
  }, [apiUrl]);

  const handleFolderClick = (folderType) => {
    navigate(`/documents?type=${folderType}`);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {t('documentsDirectory.title')}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {folders.map((folder, index) => (
          <Card
            key={index}
            className="group hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 relative cursor-pointer backdrop-blur-3xl border-none shadow-lg"
            onClick={() => handleFolderClick(folder.title)}
          >
            <HoverArrow />
            <CardHeader className="flex flex-col items-center">
              <FolderIcon title={folder.title} />
              <CardTitle className="text-lg capitalize font-semibold group-hover:text-xl transition-all duration-300 ease-in-out">
                {folder.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-foreground/40 dark:text-foreground/25 hover:text-gray-700 dark:hover:text-gray-100 transition-colors duration-300">
                {folder.documentCount} {folder.documentCount !== 1 ? t('documentsDirectory.documents') : t('documentsDirectory.document')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
